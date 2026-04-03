/**
 * Service Grid Component Generator
 *
 * Generates a grid of bookable services.
 */

export interface ServiceGridOptions {
  componentName?: string;
  endpoint?: string;
  title?: string;
}

export function generateServiceGrid(options: ServiceGridOptions = {}): string {
  const {
    componentName = 'ServiceGrid',
    endpoint = '/services',
    title = 'Our Services',
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Clock, DollarSign, Briefcase } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  title?: string;
  limit?: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ title = '${title}', limit }) => {
  const navigate = useNavigate();

  const { data: services, isLoading } = useQuery({
    queryKey: ['services', limit],
    queryFn: async () => {
      let url = '${endpoint}';
      if (limit) url += '?limit=' + limit;
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
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services && services.length > 0 ? (
            services.map((service: any) => (
              <div
                key={service.id}
                onClick={() => navigate('/services/' + service.id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                {service.image_url && (
                  <img src={service.image_url} alt={service.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{service.description}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{service.duration || 30} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{service.price || 0}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No services available</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}

export function generateStaffGrid(options: { componentName?: string; endpoint?: string; title?: string } = {}): string {
  const { componentName = 'StaffGrid', endpoint = '/staff', title = 'Our Team' } = options;

  return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Star, Users } from 'lucide-react';
import { api } from '@/lib/api';

interface ${componentName}Props {
  title?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({ title = '${title}' }) => {
  const { data: staff, isLoading } = useQuery({
    queryKey: ['staff'],
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
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h2>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {staff && staff.length > 0 ? (
            staff.map((member: any) => (
              <div key={member.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.title || member.role}</p>
                {member.rating && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{member.rating}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No staff members found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}
