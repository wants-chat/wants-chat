import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateFeatureShowcaseGrid = (
  resolved: ResolvedComponent,
  variant: 'twoColumn' | 'threeColumn' | 'fourColumn' = 'threeColumn'
) => {
  const dataSource = resolved.dataSource;
  const props = resolved.props || {};
  const columns = props.columns || (variant === 'twoColumn' ? 2 : variant === 'threeColumn' ? 3 : 4);
  const showImages = props.showImages !== false; // Default true
  const showDescription = props.showDescription !== false; // Default true

  // Parse data source for clean prop naming (sanitize to camelCase)
  const sanitizeVariableName = (name: string): string => {
    // Replace dots and underscores with camelCase
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

  // Helper to get field mapping
  const getFieldMapping = (targetField: string): string => {
    const mapping = resolved.fieldMappings.find(m => m.targetField === targetField);
    return mapping?.sourceField || targetField;
  };

  // Detect fields from the resolved component
  const idField = getFieldMapping('id');
  const nameField = getFieldMapping('name');
  const titleField = getFieldMapping('title');
  const descriptionField = getFieldMapping('description');
  const imageField = getFieldMapping('image_url') || getFieldMapping('image') || getFieldMapping('thumbnail');
  const slugField = getFieldMapping('slug');

  // Determine grid columns class based on columns prop
  const getGridClass = () => {
    switch (columns) {
      case 2:
        return 'grid md:grid-cols-2 gap-8';
      case 3:
        return 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8';
      case 4:
        return 'grid sm:grid-cols-2 lg:grid-cols-4 gap-6';
      default:
        return 'grid sm:grid-cols-2 lg:grid-cols-3 gap-8';
    }
  };

  // Generate dynamic component code
  return `
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getVariantStyles, type DesignVariant, type ColorScheme } from '@/lib/design-variants';
import { UI_VARIANT, UI_COLOR_SCHEME } from '@/lib/ui-config';

interface ${dataName.charAt(0).toUpperCase() + dataName.slice(1)}Item {
  ${idField}: string;
  ${nameField || titleField}: string;
  ${showDescription ? `${descriptionField}?: string;` : ''}
  ${showImages ? `${imageField}?: string;` : ''}
  ${slugField}?: string;
}

interface FeatureShowcaseGridProps {
  ${dataName}?: ${dataName.charAt(0).toUpperCase() + dataName.slice(1)}Item[];
  className?: string;
  title?: string;
  variant?: DesignVariant;
  colorScheme?: ColorScheme;
  [key: string]: any;
}

const FeatureShowcaseGrid: React.FC<FeatureShowcaseGridProps> = ({
  ${dataName}: propData = [],
  className,
  title,
  variant = UI_VARIANT,
  colorScheme = UI_COLOR_SCHEME
}) => {
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${dataName}', '${apiRoute}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response || []);
    },
    enabled: !propData || (Array.isArray(propData) && propData.length === 0),
    retry: 1,
  });

  const ${dataName} = (propData && (Array.isArray(propData) && propData.length > 0)) ? propData : fetchedData || [];

  if (isLoading && (!propData || (Array.isArray(propData) && propData.length === 0))) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const styles = getVariantStyles(variant, colorScheme);
  // Handle both array data and single object with items
  const items = Array.isArray(${dataName}) ? ${dataName} : [];

  if (!items || items.length === 0) {
    return (
      <section className={cn("py-16 sm:py-20", styles.background, className)}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {title && (
            <div className="text-center mb-12">
              <h2 className={cn("text-3xl sm:text-4xl font-bold mb-4", styles.title)}>
                {title}
              </h2>
            </div>
          )}
          <div className="text-center py-12">
            <p className={styles.subtitle}>No items to display</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn("py-16 sm:py-20", styles.background, className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {title && (
          <div className="text-center mb-12">
            <h2 className={cn("text-3xl sm:text-4xl font-bold mb-4", styles.title)}>
              {title}
            </h2>
          </div>
        )}

        {/* Dynamic Grid */}
        <div className="${getGridClass()}">
          {items.map((item: ${dataName.charAt(0).toUpperCase() + dataName.slice(1)}Item) => {
            const itemName = item.${nameField || titleField} || 'Untitled';
            const itemId = item.${idField};
            const itemSlug = item.${slugField} || itemId;
            ${showDescription ? `const itemDescription = item.${descriptionField} || '';` : ''}
            ${showImages ? `const itemImage = item.${imageField};` : ''}

            return (
              <Link
                key={itemId}
                to={\`/\${itemSlug}\`}
                className="block group"
              >
                <Card className={cn("h-full transition-all duration-300 cursor-pointer overflow-hidden", styles.card, styles.cardHover, styles.border)}>
                  ${showImages ? `
                  {itemImage && (
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={itemImage}
                        alt={itemName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300", styles.gradient)} />
                    </div>
                  )}
                  ` : ''}
                  <CardHeader>
                    <CardTitle className={cn("text-xl font-bold transition-colors line-clamp-2", styles.title)}>
                      {itemName}
                    </CardTitle>
                  </CardHeader>
                  ${showDescription ? `
                  <CardContent>
                    <CardDescription className={cn("leading-relaxed line-clamp-3", styles.text)}>
                      {itemDescription}
                    </CardDescription>
                  </CardContent>
                  ` : ''}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcaseGrid;
  `;
};
