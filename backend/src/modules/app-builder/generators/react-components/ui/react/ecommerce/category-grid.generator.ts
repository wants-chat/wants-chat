import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateCategoryGrid = (resolved: ResolvedComponent, variant?: string) => {
  const dataSource = resolved.dataSource;

  // Get the resolved field names from the field resolver service
  const getField = (fieldName: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === fieldName);
    if (mapping?.sourceField) {
      return `propData?.${mapping.sourceField}`;
    }
    // Return undefined/empty for missing data - let component handle gracefully
    if (fieldName === 'id' || fieldName.endsWith('Id')) {
      return `propData?.id || ${dataName}?._id`;
    }
    if (fieldName.match(/items|categories|list|array/i)) {
      return `propData?.${fieldName} || ([] as any[])`;
    }
    return `propData?.${fieldName} || ''`;
  };

  // Parse data source for clean prop naming
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
    if (!dataSource || dataSource.trim() === '') return 'data';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'data';
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
    return `/${dataSource || 'data'}`;
  };

  const apiRoute = getApiRoute();

  return `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  product_count?: number;
}

interface CategoryGridProps {
  [key: string]: any;
  className?: string;
  columns?: number;
  showDescription?: boolean;
}

const CategoryGridComponent: React.FC<CategoryGridProps> = ({
  data,
  ${dataName}: initialData,
  onCategoryClick,
  className,
  columns = 3,
  showDescription = true
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: () => api.get('${apiRoute}'),
    initialData: initialData || data,
  });

  if (isLoading && !fetchedData && !data && !initialData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Use either the generic 'data' prop or the specific prop name
  const sourceData = fetchedData || data || initialData;

  // Normalize data structure - handle both array and object with categories property
  const categoriesList: Category[] = Array.isArray(sourceData)
    ? sourceData
    : (sourceData?.categories || sourceData?.items || []);

  // Show empty state when no data is available
  if (!categoriesList || categoriesList.length === 0) {
    return (
      <div className={cn("py-12 bg-gray-50 dark:bg-gray-900 transition-colors", className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Categories will appear here once they are added.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  const getGridCols = () => {
    switch(columns) {
      case 2: return 'md:grid-cols-2';
      case 3: return 'md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'md:grid-cols-2 lg:grid-cols-4';
      default: return 'md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={cn("py-12 bg-gray-50 dark:bg-gray-900 transition-colors", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={\`grid grid-cols-1 \${getGridCols()} gap-6\`}>
          {categoriesList.map((category: Category) => (
            <div
              key={category.id}
              className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
            >
              {/* Category Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {category.name}
                  </h3>
                  {category.product_count !== undefined && (
                    <p className="text-sm text-gray-200">
                      {category.product_count} products
                    </p>
                  )}
                </div>
              </div>

              {/* Category Description */}
              {showDescription && category.description && (
                <div className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGridComponent;
  `;
};
