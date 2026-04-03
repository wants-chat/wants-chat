/**
 * Data Grid Component Generator
 *
 * Generates a responsive card-based grid for displaying entity data.
 */

export interface DataGridOptions {
  componentName?: string;
  entity?: string;
  columns?: 2 | 3 | 4 | 5 | 6;
  showTitle?: boolean;
}

export function generateDataGrid(options: DataGridOptions = {}): string {
  const {
    componentName = 'DataGrid',
    entity = 'category',
    columns = 4,
    showTitle = true,
  } = options;

  return `import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Grid } from 'lucide-react';
import { api } from '@/lib/api';

// Simple pluralization for common cases
const pluralize = (word: string): string => {
  if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(suffix => word.endsWith(suffix))) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
};

interface ${componentName}Props {
  entity?: string;
  title?: string;
  columns?: number;
  className?: string;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  entity = '${entity}',
  title,
  columns = ${columns},
  className,
}) => {
  const navigate = useNavigate();
  const endpoint = pluralize(entity);

  const { data, isLoading, error } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => {
      const response = await api.get<any>('/' + endpoint);
      return Array.isArray(response) ? response : (response?.data || []);
    },
  });

  // Tailwind doesn't support dynamic classes, use mapping
  const getGridCols = () => {
    switch (columns) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-3';
      case 4: return 'md:grid-cols-4';
      case 5: return 'md:grid-cols-5';
      case 6: return 'md:grid-cols-6';
      default: return 'md:grid-cols-4';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <section className={\`py-12 \${className || ''}\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-500">Failed to load data.</div>
        </div>
      </section>
    );
  }

  if (!data?.length) {
    return (
      <section className={\`py-12 \${className || ''}\`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          ${showTitle ? `{title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h2>
          )}` : ''}
          <div className="text-center py-8">
            <Grid className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No {entity}s found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={\`py-12 \${className || ''}\`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        ${showTitle ? `{title && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">{title}</h2>
        )}` : ''}
        <div className={\`grid grid-cols-2 \${getGridCols()} gap-6\`}>
          {data.map((item: any) => (
            <div
              key={item.id}
              onClick={() => navigate('/' + endpoint + '/' + item.id)}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
            >
              {item.image_url ? (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/50">
                    {(item.name || item.title || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {item.name || item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ${componentName};
`;
}
