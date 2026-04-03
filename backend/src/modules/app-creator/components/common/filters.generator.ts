/**
 * Filters Generator
 *
 * Generates filter components with:
 * - Search input
 * - Dropdown filters
 * - Date range picker
 * - Status filters
 * - Clear all functionality
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export type FilterType =
  | 'search'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'dateRange'
  | 'checkbox'
  | 'radio'
  | 'range'
  | 'fk';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  name: string;
  label?: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  // For FK filters
  fkEntity?: string;
  fkEndpoint?: string;
  fkDisplayField?: string;
  fkValueField?: string;
  // For range filters
  min?: number;
  max?: number;
  step?: number;
}

export interface FiltersOptions {
  componentName?: string;
  filters: FilterConfig[];
  layout?: 'horizontal' | 'vertical' | 'sidebar';
  showClearAll?: boolean;
  collapsible?: boolean;
}

/**
 * Generate a filters component
 */
export function generateFilters(options: FiltersOptions): string {
  const {
    filters,
    layout = 'horizontal',
    showClearAll = true,
    collapsible = false,
  } = options;

  const componentName = options.componentName || 'Filters';

  // Collect FK filters for data fetching
  const fkFilters = filters.filter(f => f.type === 'fk' && f.fkEntity);

  // Build initial filter values
  const initialFilters: Record<string, any> = {};
  filters.forEach(f => {
    if (f.type === 'multiselect' || f.type === 'checkbox') {
      initialFilters[f.name] = [];
    } else if (f.type === 'dateRange') {
      initialFilters[f.name] = { start: '', end: '' };
    } else if (f.type === 'range') {
      initialFilters[f.name] = f.min ?? 0;
    } else {
      initialFilters[f.name] = '';
    }
  });

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-end gap-4',
    vertical: 'space-y-4',
    sidebar: 'space-y-6',
  };

  return `import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X, Filter, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface FilterValues {
  ${filters.map(f => {
    if (f.type === 'multiselect' || f.type === 'checkbox') return `${f.name}: string[];`;
    if (f.type === 'dateRange') return `${f.name}: { start: string; end: string };`;
    if (f.type === 'range') return `${f.name}: number;`;
    return `${f.name}: string;`;
  }).join('\n  ')}
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<FilterValues>;
  onChange?: (filters: FilterValues) => void;
  onSearch?: (filters: FilterValues) => void;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
}) => {
  const [filters, setFilters] = useState<FilterValues>(${JSON.stringify(initialFilters)});
  ${collapsible ? 'const [expanded, setExpanded] = useState(true);' : ''}

  // Merge with prop values
  const currentFilters = { ...filters, ...propValues };

  ${fkFilters.map(f => {
    const fkTableName = snakeCase(pluralize.plural(f.fkEntity || ''));
    const fkEndpoint = f.fkEndpoint || '/' + fkTableName;
    const queryKeyName = f.name + 'Options';
    return `// Fetch ${f.fkEntity} options
  const { data: ${queryKeyName} = [] } = useQuery({
    queryKey: ['${fkTableName}'],
    queryFn: async () => {
      try {
        const response = await api.get<any>('${fkEndpoint}');
        return Array.isArray(response) ? response : (response?.data || []);
      } catch (err) {
        return [];
      }
    },
  });`;
  }).join('\n\n  ')}

  const updateFilter = useCallback((name: string, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const clearAll = useCallback(() => {
    const cleared = ${JSON.stringify(initialFilters)};
    setFilters(cleared);
    if (onChange) onChange(cleared);
    if (onSearch) onSearch(cleared);
  }, [onChange, onSearch]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const hasActiveFilters = ${filters.map(f => {
    if (f.type === 'multiselect' || f.type === 'checkbox') return `currentFilters.${f.name}?.length > 0`;
    if (f.type === 'dateRange') return `(currentFilters.${f.name}?.start || currentFilters.${f.name}?.end)`;
    return `currentFilters.${f.name}`;
  }).join(' || ')};

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700', className)}>
      ${collapsible ? `{/* Collapsible Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Active
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {expanded && (` : ''}
        <div className="p-4 ${collapsible ? 'border-t border-gray-200 dark:border-gray-700' : ''}">
          <div className="${layoutClasses[layout]}">
            ${filters.map(f => generateFilterField(f, layout)).join('\n            ')}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            ${showClearAll ? `<button
              onClick={clearAll}
              disabled={!hasActiveFilters}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            >
              Clear all filters
            </button>` : '<div />'}
            {onSearch && (
              <button
                onClick={handleSearch}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4" />
                Apply Filters
              </button>
            )}
          </div>
        </div>
      ${collapsible ? ')}' : ''}
    </div>
  );
};

export default ${componentName};
`;
}

function generateFilterField(filter: FilterConfig, layout: string): string {
  const label = filter.label || formatFieldLabel(filter.name);
  const isVertical = layout === 'vertical' || layout === 'sidebar';
  const baseInputClasses = 'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500';

  switch (filter.type) {
    case 'search':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'flex-1 min-w-[200px]'}">
              ${isVertical ? `<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>` : ''}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={currentFilters.${filter.name}}
                  onChange={(e) => updateFilter('${filter.name}', e.target.value)}
                  placeholder="${filter.placeholder || `Search ${label.toLowerCase()}...`}"
                  className="${baseInputClasses} pl-10"
                />
                {currentFilters.${filter.name} && (
                  <button
                    onClick={() => updateFilter('${filter.name}', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>`;

    case 'select':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[150px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <select
                value={currentFilters.${filter.name}}
                onChange={(e) => updateFilter('${filter.name}', e.target.value)}
                className="${baseInputClasses}"
              >
                <option value="">All</option>
                ${filter.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n                ') || ''}
              </select>
            </div>`;

    case 'fk':
      const optionsVar = filter.name + 'Options';
      const displayField = filter.fkDisplayField || 'name';
      const valueField = filter.fkValueField || 'id';
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[150px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <select
                value={currentFilters.${filter.name}}
                onChange={(e) => updateFilter('${filter.name}', e.target.value)}
                className="${baseInputClasses}"
              >
                <option value="">All</option>
                {${optionsVar}.map((opt: any) => (
                  <option key={opt.${valueField} || opt._id} value={opt.${valueField} || opt._id}>
                    {opt.${displayField}}
                  </option>
                ))}
              </select>
            </div>`;

    case 'multiselect':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[200px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <div className="space-y-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 max-h-40 overflow-y-auto">
                ${filter.options?.map(opt => `
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(currentFilters.${filter.name} || []).includes('${opt.value}')}
                    onChange={() => {
                      const current = currentFilters.${filter.name} || [];
                      const updated = current.includes('${opt.value}')
                        ? current.filter((v: string) => v !== '${opt.value}')
                        : [...current, '${opt.value}'];
                      updateFilter('${filter.name}', updated);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">${opt.label}</span>
                </label>`).join('') || ''}
              </div>
            </div>`;

    case 'checkbox':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : ''}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <div className="flex flex-wrap gap-2">
                ${filter.options?.map(opt => `
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors \${
                  (currentFilters.${filter.name} || []).includes('${opt.value}')
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }">
                  <input
                    type="checkbox"
                    checked={(currentFilters.${filter.name} || []).includes('${opt.value}')}
                    onChange={() => {
                      const current = currentFilters.${filter.name} || [];
                      const updated = current.includes('${opt.value}')
                        ? current.filter((v: string) => v !== '${opt.value}')
                        : [...current, '${opt.value}'];
                      updateFilter('${filter.name}', updated);
                    }}
                    className="sr-only"
                  />
                  <span className="text-sm">${opt.label}</span>
                </label>`).join('') || ''}
              </div>
            </div>`;

    case 'radio':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : ''}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors \${
                  !currentFilters.${filter.name}
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }">
                  <input
                    type="radio"
                    name="${filter.name}"
                    checked={!currentFilters.${filter.name}}
                    onChange={() => updateFilter('${filter.name}', '')}
                    className="sr-only"
                  />
                  <span className="text-sm">All</span>
                </label>
                ${filter.options?.map(opt => `
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-full cursor-pointer transition-colors \${
                  currentFilters.${filter.name} === '${opt.value}'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }">
                  <input
                    type="radio"
                    name="${filter.name}"
                    checked={currentFilters.${filter.name} === '${opt.value}'}
                    onChange={() => updateFilter('${filter.name}', '${opt.value}')}
                    className="sr-only"
                  />
                  <span className="text-sm">${opt.label}</span>
                </label>`).join('') || ''}
              </div>
            </div>`;

    case 'date':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[150px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={currentFilters.${filter.name}}
                  onChange={(e) => updateFilter('${filter.name}', e.target.value)}
                  className="${baseInputClasses} pl-10"
                />
              </div>
            </div>`;

    case 'dateRange':
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[300px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">${label}</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={currentFilters.${filter.name}?.start || ''}
                    onChange={(e) => updateFilter('${filter.name}', { ...currentFilters.${filter.name}, start: e.target.value })}
                    placeholder="Start date"
                    className="${baseInputClasses} pl-10"
                  />
                </div>
                <span className="text-gray-500">to</span>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={currentFilters.${filter.name}?.end || ''}
                    onChange={(e) => updateFilter('${filter.name}', { ...currentFilters.${filter.name}, end: e.target.value })}
                    placeholder="End date"
                    className="${baseInputClasses} pl-10"
                  />
                </div>
              </div>
            </div>`;

    case 'range':
      const min = filter.min ?? 0;
      const max = filter.max ?? 100;
      const step = filter.step ?? 1;
      return `{/* ${label} */}
            <div className="${isVertical ? 'w-full' : 'min-w-[200px]'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ${label}: <span className="font-normal">{currentFilters.${filter.name}}</span>
              </label>
              <input
                type="range"
                min="${min}"
                max="${max}"
                step="${step}"
                value={currentFilters.${filter.name}}
                onChange={(e) => updateFilter('${filter.name}', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${min}</span>
                <span>${max}</span>
              </div>
            </div>`;

    default:
      return '';
  }
}

/**
 * Generate status filter preset
 */
export function generateStatusFilter(statuses: string[]): FilterConfig {
  return {
    name: 'status',
    label: 'Status',
    type: 'radio',
    options: statuses.map(s => ({
      value: s.toLowerCase(),
      label: formatFieldLabel(s),
    })),
  };
}

/**
 * Generate common filters for an entity
 */
export function generateEntityFilters(entity: string, additionalFilters: FilterConfig[] = []): string {
  const componentName = pascalCase(entity) + 'Filters';

  const defaultFilters: FilterConfig[] = [
    { name: 'search', type: 'search', placeholder: `Search ${formatFieldLabel(entity).toLowerCase()}s...` },
    ...additionalFilters,
  ];

  return generateFilters({
    componentName,
    filters: defaultFilters,
  });
}
