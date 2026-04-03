/**
 * Agent Grid Component Generator
 */

export interface AgentGridOptions {
  componentName?: string;
  endpoint?: string;
}

export function generateAgentGrid(options: AgentGridOptions = {}): string {
  const { componentName = 'AgentGrid', endpoint = '/agents' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Loader2, User, Star, Phone, Mail, Home } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents'],
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {agents && agents.length > 0 ? (
        agents.map((agent: any) => (
          <Link
            key={agent.id}
            to={\`/agents/\${agent.id}\`}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4 mb-4">
              {agent.avatar_url ? (
                <img src={agent.avatar_url} alt={agent.name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
                {agent.title && <p className="text-sm text-gray-500">{agent.title}</p>}
              </div>
            </div>
            {agent.rating && (
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium text-gray-900 dark:text-white">{agent.rating}</span>
                {agent.reviews_count && (
                  <span className="text-gray-500 text-sm">({agent.reviews_count} reviews)</span>
                )}
              </div>
            )}
            <div className="space-y-2 text-sm text-gray-500">
              {agent.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {agent.phone}
                </p>
              )}
              {agent.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {agent.email}
                </p>
              )}
              {agent.listings_count && (
                <p className="flex items-center gap-2">
                  <Home className="w-4 h-4" /> {agent.listings_count} active listings
                </p>
              )}
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No agents found
        </div>
      )}
    </div>
  );
};

export default ${componentName};
`;
}

export function generateAgentProfile(options: AgentGridOptions = {}): string {
  const { componentName = 'AgentProfile', endpoint = '/agents' } = options;

  return `import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Star, Phone, Mail, MapPin, Award, Home, Calendar } from 'lucide-react';
import { api } from '@/lib/api';

const ${componentName}: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
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

  if (!agent) {
    return <div className="text-center py-12 text-gray-500">Agent not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {agent.avatar_url ? (
            <img src={agent.avatar_url} alt={agent.name} className="w-32 h-32 rounded-full object-cover border-4 border-white" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-16 h-16" />
            </div>
          )}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            {agent.title && <p className="opacity-90">{agent.title}</p>}
            {agent.rating && (
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium">{agent.rating}</span>
                {agent.reviews_count && <span className="opacity-75">({agent.reviews_count} reviews)</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Contact Information</h3>
            {agent.phone && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4" /> {agent.phone}
              </p>
            )}
            {agent.email && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4" /> {agent.email}
              </p>
            )}
            {agent.location && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" /> {agent.location}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 dark:text-white">Statistics</h3>
            {agent.experience_years && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" /> {agent.experience_years} years experience
              </p>
            )}
            {agent.properties_sold && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Award className="w-4 h-4" /> {agent.properties_sold} properties sold
              </p>
            )}
            {agent.listings_count && (
              <p className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Home className="w-4 h-4" /> {agent.listings_count} active listings
              </p>
            )}
          </div>
        </div>

        {agent.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">About</h3>
            <p className="text-gray-600 dark:text-gray-400">{agent.bio}</p>
          </div>
        )}

        {agent.specialties && agent.specialties.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {agent.specialties.map((spec: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm">
                  {spec}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            to={\`/properties?agent=\${agent.id}\`}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium"
          >
            View Listings
          </Link>
          <a
            href={\`mailto:\${agent.email}\`}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Mail className="w-5 h-5" />
          </a>
          {agent.phone && (
            <a
              href={\`tel:\${agent.phone}\`}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ${componentName};
`;
}
