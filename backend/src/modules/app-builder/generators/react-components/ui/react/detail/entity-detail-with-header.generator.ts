/**
 * Entity Detail with Header Component Generator
 *
 * Generic detail view with:
 * - Cover image/header
 * - Entity information display
 * - Flexible field rendering
 * - Works for ANY entity type (restaurants, products, posts, etc.)
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';

export const generateEntityDetailWithHeader = (resolved: ResolvedComponent) => {
  const { dataSource, title = 'Details' } = resolved;
  const entity = resolved.data?.entity || dataSource;
  const fields = resolved.data?.fields || [];
  const props = resolved.props || {};

  // Find key fields dynamically
  // Prioritizes the first match in possibleNames order (not fields order)
  const findField = (possibleNames: string[]) => {
    for (const possibleName of possibleNames) {
      const field = fields.find(f => f.name === possibleName);
      if (field) return field.name;
    }
    return undefined;
  };

  const imageField = findField(['cover_image', 'featured_image', 'image', 'image_url', 'thumbnail', 'logo_url']);
  const titleField = findField(['title', 'name']);
  const descriptionField = findField(['description', 'bio', 'about', 'summary', 'excerpt']);
  const ratingField = findField(['rating', 'average_rating', 'score']);
  const reviewCountField = findField(['review_count', 'reviews_count', 'total_reviews']);
  const priceField = findField(['price', 'delivery_fee', 'fee', 'cost', 'amount']);
  const locationField = findField(['location', 'address', 'city']);
  const phoneField = findField(['phone', 'phone_number', 'contact']);
  const statusField = findField(['is_open', 'is_active', 'status', 'active']);

  // Group fields by type for better display
  const generateFieldDisplay = (field: any) => {
    const fieldName = field.name;
    const fieldType = field.type;
    const label = field.label || fieldName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

    // Skip fields that are shown in header or are IDs
    const skipFields = [imageField, titleField, descriptionField, 'id', 'user_id', 'created_at', 'updated_at'];
    if (skipFields.includes(fieldName)) {
      return '';
    }

    // Rating field - special display
    if (fieldName === ratingField || fieldName === reviewCountField) {
      return '';  // Handled in header
    }

    // Boolean fields
    if (fieldType === 'boolean' || fieldName.startsWith('is_')) {
      return `
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">${label}</span>
              <span className={\`px-3 py-1 rounded-full text-xs font-medium \${data?.${fieldName} ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}\`}>
                {data?.${fieldName} ? 'Yes' : 'No'}
              </span>
            </div>`;
    }

    // Number fields
    if (fieldType === 'number' || fieldName.includes('count') || fieldName.includes('price') || fieldName.includes('fee')) {
      return `
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">${label}</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {${fieldName.includes('price') || fieldName.includes('fee') || fieldName.includes('amount')
                  ? `data?.currency ? \`\${data.currency} \${data.${fieldName}}\` : \`$\${data?.${fieldName}}\``
                  : `data?.${fieldName}`} || '-'}
              </span>
            </div>`;
    }

    // Date fields
    if (fieldType === 'date' || fieldName.includes('date') || fieldName.includes('_at')) {
      return `
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">${label}</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {data?.${fieldName} ? new Date(data.${fieldName}).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '-'}
              </span>
            </div>`;
    }

    // Object/JSON fields (detect by field name or type)
    const isObjectField = fieldType === 'object' || fieldType === 'json' ||
                         fieldName.includes('_types') || fieldName.includes('location') ||
                         fieldName.includes('_hours') || fieldName.includes('metadata') ||
                         fieldName.includes('config') || fieldName.includes('settings');

    if (isObjectField) {
      return `
            {data?.${fieldName} && typeof data.${fieldName} === 'object' && (
              <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">${label}</span>
                <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  {data.${fieldName}.info || JSON.stringify(data.${fieldName}, null, 2)}
                </div>
              </div>
            )}`;
    }

    // Textarea/long text fields
    if (fieldType === 'textarea' || fieldName === 'notes' || fieldName === 'details') {
      return `
            {data?.${fieldName} && (
              <div className="py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">${label}</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {data.${fieldName}}
                </p>
              </div>
            )}`;
    }

    // Default text field
    return `
            <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">${label}</span>
              <span className="text-sm text-gray-900 dark:text-white">
                {data?.${fieldName} || '-'}
              </span>
            </div>`;
  };

  const fieldDisplays = fields.map(generateFieldDisplay).filter(Boolean).join('\n');

  return `import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Star, Edit, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface EntityDetailWithHeaderProps {
  data?: any;
  title?: string;
  className?: string;
  variant?: string;
  colorScheme?: string;
  showBackButton?: boolean;
  showEditButton?: boolean;
  backRoute?: string;
  editRoute?: string;
  [key: string]: any; // Accept any additional props from catalog
}

export default function EntityDetailWithHeader({
  data: propData,
  className,
  showBackButton = true,
  showEditButton = false,
  backRoute,
  editRoute
}: EntityDetailWithHeaderProps) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch data if not provided via props
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ['${entity}', id],
    queryFn: async () => {
      const response = await api.get<any>(\`/${entity}/\${id}\`);
      // Extract actual data from wrapper { success: true, data: {...} }
      return response.data?.data || response.data || response;
    },
    enabled: !propData && !!id,
  });

  const data = propData || fetchedData;

  const handleBack = () => {
    if (backRoute) {
      navigate(backRoute);
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    if (editRoute && id) {
      navigate(editRoute.replace(':id', id));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
        <div className="p-6 space-y-3">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error ? 'Failed to load details' : 'No data available'}
        </p>
        <Button onClick={handleBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Image */}
      ${imageField ? `{data?.${imageField} && (
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
          <img
            src={data.${imageField}}
            alt={data?.${titleField || 'name'} || 'Cover'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Action buttons overlay */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            {showBackButton && (
              <Button
                onClick={handleBack}
                variant="outline"
                size="sm"
                className="bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {showEditButton && editRoute && (
              <Button
                onClick={handleEdit}
                size="sm"
                className="bg-white/90 hover:bg-white dark:bg-gray-900/90 dark:hover:bg-gray-900"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}` : ''}

      {/* Main Info Card */}
      <Card>
        <CardContent className="p-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {data?.${titleField || 'name'} || 'Untitled'}
              </h1>
              ${ratingField ? `{data?.${ratingField} !== undefined && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {Number(data.${ratingField}).toFixed(1)}
                    </span>
                  </div>
                  ${reviewCountField ? `{data?.${reviewCountField} && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({data.${reviewCountField}} reviews)
                    </span>
                  )}` : ''}
                </div>
              )}` : ''}
            </div>
            ${statusField ? `{data?.${statusField} !== undefined && (
              <span className={\`px-3 py-1 rounded-full text-sm font-medium \${
                data.${statusField}
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }\`}>
                {data.${statusField} ? 'Open' : 'Closed'}
              </span>
            )}` : ''}
          </div>

          {/* Description */}
          ${descriptionField ? `{data?.${descriptionField} && (
            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {data.${descriptionField}}
            </p>
          )}` : ''}

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            ${phoneField ? `{data?.${phoneField} && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.${phoneField}}
                  </p>
                </div>
              </div>
            )}` : ''}
            ${locationField ? `{data?.${locationField} && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {typeof data.${locationField} === 'object'
                      ? data.${locationField}.info || JSON.stringify(data.${locationField})
                      : data.${locationField}}
                  </p>
                </div>
              </div>
            )}` : ''}
          </div>

          {/* All Fields */}
          <div className="space-y-2">
            ${fieldDisplays}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons (if not in header) */}
      ${!imageField ? `<div className="flex items-center gap-3">
        {showBackButton && (
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {showEditButton && editRoute && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>` : ''}
    </div>
  );
}
`;
};
