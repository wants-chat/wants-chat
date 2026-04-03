/**
 * Prescription List Generator
 *
 * Generates a prescription/medication list component.
 */

import { ResolvedComponent } from '../../../types/resolved-component.interface';
import { getStyleClasses } from '../../../helpers/style-helpers';

export const generatePrescriptionList = (
  resolved: ResolvedComponent,
  variant: 'full' | 'compact' | 'refill' = 'full'
): string => {
  const styles = getStyleClasses(resolved.uiStyle);
  const dataSource = resolved.dataSource;

  // Parse data source for clean prop naming (sanitize to camelCase)
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
    if (!dataSource || dataSource.trim() === '') return 'prescriptions';
    const parts = dataSource.split('.');
    const lastPart = parts[parts.length - 1];
    return lastPart ? sanitizeVariableName(lastPart) : 'prescriptions';
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
    return `/${dataSource || 'prescriptions'}`;
  };

  const apiRoute = getApiRoute();
  const entity = dataSource?.split('.').pop() || 'prescriptions';

  if (variant === 'compact') {
    return `import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  refillsRemaining: number;
}

interface PrescriptionListProps {
  ${dataName}?: Prescription[];
  onRefill?: (id: string) => void;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({
  ${dataName}: propData,
  onRefill,
}) => {
  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.prescriptions || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const prescriptions = propData || fetchedData || [];

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl p-4 ${styles.cardShadow}">
      <h3 className="${styles.textPrimary} font-semibold mb-4">Current Prescriptions</h3>
      <div className="space-y-3">
        {prescriptions.map((rx) => (
          <div key={rx.id} className="flex items-center justify-between py-2 border-b ${styles.cardBorder} last:border-0">
            <div>
              <p className="${styles.textPrimary} font-medium">{rx.medicationName}</p>
              <p className="${styles.textMuted} text-sm">{rx.dosage} • {rx.frequency}</p>
            </div>
            <button
              onClick={() => onRefill?.(rx.id)}
              disabled={rx.refillsRemaining === 0}
              className={\`px-3 py-1.5 text-sm rounded-lg transition-colors \${
                rx.refillsRemaining > 0
                  ? '${styles.button} text-white hover:${styles.buttonHover}'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }\`}
            >
              Refill ({rx.refillsRemaining})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrescriptionList;
`;
  }

  if (variant === 'refill') {
    return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  lastFilled: string;
  nextRefillDate: string;
  refillsRemaining: number;
  pharmacy: string;
  prescribedBy: string;
}

interface PrescriptionListProps {
  ${dataName}?: Prescription[];
  onRefill: (ids: string[]) => void;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({
  ${dataName}: propData,
  onRefill,
}) => {
  const [selected, setSelected] = useState<string[]>([]);

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.prescriptions || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const prescriptions = propData || fetchedData || [];

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const refillable = prescriptions.filter(rx => rx.refillsRemaining > 0).map(rx => rx.id);
    setSelected(selected.length === refillable.length ? [] : refillable);
  };

  const isRefillable = (rx: Prescription) => rx.refillsRemaining > 0;

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl ${styles.cardShadow} overflow-hidden">
      <div className="${styles.primary} p-4 text-white">
        <h2 className="text-lg font-bold">Prescription Refills</h2>
        <p className="text-white/80 text-sm">Select medications to refill</p>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={selectAll}
            className="${styles.textSecondary} text-sm hover:${styles.textPrimary} transition-colors"
          >
            {selected.length === prescriptions.filter(isRefillable).length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="${styles.textMuted} text-sm">
            {selected.length} selected
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              onClick={() => isRefillable(rx) && toggleSelect(rx.id)}
              className={\`p-4 rounded-lg border transition-all cursor-pointer \${
                selected.includes(rx.id)
                  ? 'border-2 border-current ${styles.primary}'
                  : isRefillable(rx)
                  ? '${styles.cardBorder} hover:${styles.background}'
                  : 'border-gray-200 opacity-50 cursor-not-allowed'
              }\`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selected.includes(rx.id)}
                  disabled={!isRefillable(rx)}
                  onChange={() => {}}
                  className="mt-1 w-5 h-5 rounded border-gray-300"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="${styles.textPrimary} font-medium">{rx.medicationName}</h4>
                      <p className="${styles.textSecondary} text-sm">{rx.dosage} • {rx.frequency}</p>
                    </div>
                    <span className={\`px-2 py-1 text-xs rounded-full \${
                      rx.refillsRemaining > 2 ? 'bg-green-100 text-green-700' :
                      rx.refillsRemaining > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }\`}>
                      {rx.refillsRemaining} refills left
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs ${styles.textMuted}">
                    <p>Last Filled: {new Date(rx.lastFilled).toLocaleDateString()}</p>
                    <p>Next Refill: {new Date(rx.nextRefillDate).toLocaleDateString()}</p>
                    <p>Pharmacy: {rx.pharmacy}</p>
                    <p>Prescribed by: Dr. {rx.prescribedBy}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => onRefill(selected)}
          disabled={selected.length === 0}
          className={\`w-full py-3 rounded-lg font-medium transition-colors \${
            selected.length > 0
              ? '${styles.button} text-white hover:${styles.buttonHover}'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }\`}
        >
          {selected.length > 0 ? \`Request Refill (\${selected.length})\` : 'Select Medications'}
        </button>
      </div>
    </div>
  );
};

export default PrescriptionList;
`;
  }

  // Default full variant
  return `import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Prescription {
  id: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  pharmacy?: string;
  refillsRemaining: number;
  refillsTotal: number;
  lastFilled?: string;
  nextRefillDate?: string;
  instructions?: string;
  warnings?: string[];
  status: 'active' | 'completed' | 'discontinued' | 'on-hold';
}

interface PrescriptionListProps {
  ${dataName}?: Prescription[];
  showFilters?: boolean;
  onRefill?: (id: string) => void;
  onViewDetails?: (rx: Prescription) => void;
  onDiscontinue?: (id: string) => void;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({
  ${dataName}: propData,
  showFilters = true,
  onRefill,
  onViewDetails,
  onDiscontinue,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'discontinued'>('all');
  const [search, setSearch] = useState('');

  const { data: fetchedData, isLoading } = useQuery({
    queryKey: ['${entity}'],
    queryFn: async () => {
      const response = await api.get<any>('${apiRoute}');
      return Array.isArray(response) ? response : (response?.data || response?.prescriptions || []);
    },
    enabled: !propData,
    retry: 1,
  });

  const prescriptions = propData || fetchedData || [];

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesFilter = filter === 'all' || rx.status === filter;
    const matchesSearch = rx.medicationName.toLowerCase().includes(search.toLowerCase()) ||
                          rx.genericName?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    discontinued: 'bg-red-100 text-red-700',
    'on-hold': 'bg-amber-100 text-amber-700',
  };

  if (isLoading && !propData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="${styles.card} rounded-xl ${styles.cardShadow}">
      {/* Header */}
      <div className="p-6 border-b ${styles.cardBorder}">
        <div className="flex items-center justify-between mb-4">
          <h2 className="${styles.textPrimary} text-xl font-bold">Prescriptions</h2>
          <span className="${styles.textMuted} text-sm">
            {prescriptions.filter(rx => rx.status === 'active').length} active
          </span>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search medications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border ${styles.cardBorder} rounded-lg ${styles.textPrimary}"
              />
              <svg className="w-5 h-5 ${styles.textMuted} absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              {(['all', 'active', 'completed', 'discontinued'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${
                    filter === f
                      ? '${styles.button} text-white'
                      : '${styles.background} ${styles.textSecondary} hover:${styles.textPrimary}'
                  }\`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prescription List */}
      <div className="divide-y ${styles.cardBorder}">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="${styles.textMuted}">No prescriptions found</p>
          </div>
        ) : (
          filteredPrescriptions.map((rx) => (
            <div key={rx.id} className="p-6 hover:${styles.background} transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="${styles.textPrimary} font-semibold text-lg">{rx.medicationName}</h3>
                    <span className={\`px-2 py-0.5 text-xs rounded-full \${statusColors[rx.status]}\`}>
                      {rx.status}
                    </span>
                  </div>
                  {rx.genericName && (
                    <p className="${styles.textMuted} text-sm">({rx.genericName})</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {rx.status === 'active' && rx.refillsRemaining > 0 && (
                    <button
                      onClick={() => onRefill?.(rx.id)}
                      className="${styles.button} text-white px-4 py-2 rounded-lg text-sm font-medium hover:${styles.buttonHover} transition-colors"
                    >
                      Refill
                    </button>
                  )}
                  <button
                    onClick={() => onViewDetails?.(rx)}
                    className="border ${styles.cardBorder} ${styles.textSecondary} px-4 py-2 rounded-lg text-sm font-medium hover:${styles.background} transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="${styles.textMuted} text-xs uppercase tracking-wider">Dosage</p>
                  <p className="${styles.textPrimary} font-medium">{rx.dosage}</p>
                </div>
                <div>
                  <p className="${styles.textMuted} text-xs uppercase tracking-wider">Frequency</p>
                  <p className="${styles.textPrimary} font-medium">{rx.frequency}</p>
                </div>
                <div>
                  <p className="${styles.textMuted} text-xs uppercase tracking-wider">Route</p>
                  <p className="${styles.textPrimary} font-medium">{rx.route}</p>
                </div>
                <div>
                  <p className="${styles.textMuted} text-xs uppercase tracking-wider">Refills</p>
                  <p className="${styles.textPrimary} font-medium">
                    {rx.refillsRemaining} of {rx.refillsTotal} remaining
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm ${styles.textMuted}">
                <span>Prescribed by Dr. {rx.prescribedBy}</span>
                <span>Started {new Date(rx.startDate).toLocaleDateString()}</span>
                {rx.pharmacy && <span>Pharmacy: {rx.pharmacy}</span>}
              </div>

              {rx.instructions && (
                <div className="mt-3 p-3 ${styles.background} rounded-lg">
                  <p className="${styles.textSecondary} text-sm">
                    <span className="font-medium">Instructions:</span> {rx.instructions}
                  </p>
                </div>
              )}

              {rx.warnings && rx.warnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                  <p className="text-amber-700 text-sm">
                    <span className="font-medium">Warnings:</span> {rx.warnings.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PrescriptionList;
`;
};
