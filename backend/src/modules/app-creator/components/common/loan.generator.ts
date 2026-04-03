/**
 * Loan Generator
 *
 * Generates LoanFilters components with:
 * - Amount range slider
 * - Term selection
 * - Interest rate filter
 * - Loan type dropdown
 * - Status filter
 * - Purpose filter
 */

import { pascalCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import { formatFieldLabel } from '../utils/generator-helpers';

export interface LoanType {
  value: string;
  label: string;
}

export interface LoanFiltersOptions {
  componentName?: string;
  loanTypes?: LoanType[];
  loanPurposes?: LoanType[];
  minAmount?: number;
  maxAmount?: number;
  minTerm?: number;
  maxTerm?: number;
  showAmountFilter?: boolean;
  showTermFilter?: boolean;
  showRateFilter?: boolean;
  showTypeFilter?: boolean;
  showStatusFilter?: boolean;
  showPurposeFilter?: boolean;
  layout?: 'horizontal' | 'vertical' | 'sidebar';
}

/**
 * Generate a LoanFilters component
 */
export function generateLoanFilters(options: LoanFiltersOptions = {}): string {
  const {
    loanTypes = [
      { value: 'personal', label: 'Personal Loan' },
      { value: 'mortgage', label: 'Mortgage' },
      { value: 'auto', label: 'Auto Loan' },
      { value: 'student', label: 'Student Loan' },
      { value: 'business', label: 'Business Loan' },
      { value: 'home_equity', label: 'Home Equity' },
    ],
    loanPurposes = [
      { value: 'home_purchase', label: 'Home Purchase' },
      { value: 'refinance', label: 'Refinance' },
      { value: 'debt_consolidation', label: 'Debt Consolidation' },
      { value: 'home_improvement', label: 'Home Improvement' },
      { value: 'major_purchase', label: 'Major Purchase' },
      { value: 'education', label: 'Education' },
      { value: 'medical', label: 'Medical Expenses' },
      { value: 'other', label: 'Other' },
    ],
    minAmount = 1000,
    maxAmount = 500000,
    minTerm = 6,
    maxTerm = 360,
    showAmountFilter = true,
    showTermFilter = true,
    showRateFilter = true,
    showTypeFilter = true,
    showStatusFilter = true,
    showPurposeFilter = true,
    layout = 'horizontal',
  } = options;

  const componentName = options.componentName || 'LoanFilters';

  const layoutClasses = {
    horizontal: 'flex flex-wrap items-end gap-4',
    vertical: 'space-y-4',
    sidebar: 'space-y-6',
  };

  return `import React, { useState, useCallback } from 'react';
import {
  DollarSign,
  Calendar,
  Percent,
  Filter,
  X,
  ChevronDown,
  RefreshCw,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoanFilterValues {
  search: string;
  loanType: string;
  purpose: string;
  status: string;
  amountMin: number;
  amountMax: number;
  termMin: number;
  termMax: number;
  rateMin: number;
  rateMax: number;
}

interface ${componentName}Props {
  className?: string;
  values?: Partial<LoanFilterValues>;
  onChange?: (filters: LoanFilterValues) => void;
  onSearch?: (filters: LoanFilterValues) => void;
  onReset?: () => void;
}

const loanTypes = ${JSON.stringify(loanTypes, null, 2)};

const loanPurposes = ${JSON.stringify(loanPurposes, null, 2)};

const loanStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'active', label: 'Active' },
  { value: 'paid_off', label: 'Paid Off' },
  { value: 'defaulted', label: 'Defaulted' },
];

const initialFilters: LoanFilterValues = {
  search: '',
  loanType: '',
  purpose: '',
  status: '',
  amountMin: ${minAmount},
  amountMax: ${maxAmount},
  termMin: ${minTerm},
  termMax: ${maxTerm},
  rateMin: 0,
  rateMax: 30,
};

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  values: propValues,
  onChange,
  onSearch,
  onReset,
}) => {
  const [filters, setFilters] = useState<LoanFilterValues>(initialFilters);
  const [expanded, setExpanded] = useState(true);

  const currentFilters = { ...filters, ...propValues };

  const updateFilter = useCallback((name: keyof LoanFilterValues, value: any) => {
    const updated = { ...currentFilters, [name]: value };
    setFilters(updated);
    if (onChange) onChange(updated);
  }, [currentFilters, onChange]);

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
    if (onChange) onChange(initialFilters);
    if (onReset) onReset();
  }, [onChange, onReset]);

  const handleSearch = useCallback(() => {
    if (onSearch) onSearch(currentFilters);
  }, [currentFilters, onSearch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTerm = (months: number) => {
    if (months < 12) return \`\${months} months\`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) return \`\${years} year\${years > 1 ? 's' : ''}\`;
    return \`\${years}y \${remainingMonths}m\`;
  };

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.loanType ||
    currentFilters.purpose ||
    currentFilters.status ||
    currentFilters.amountMin > ${minAmount} ||
    currentFilters.amountMax < ${maxAmount} ||
    currentFilters.termMin > ${minTerm} ||
    currentFilters.termMax < ${maxTerm} ||
    currentFilters.rateMin > 0 ||
    currentFilters.rateMax < 30;

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
      className
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-900 dark:text-white">Loan Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              Active
            </span>
          )}
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 text-gray-400 transition-transform',
          expanded && 'rotate-180'
        )} />
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="${layoutClasses[layout]}">
            {/* Search */}
            <div className="${layout === 'horizontal' ? 'flex-1 min-w-[200px]' : 'w-full'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={currentFilters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search loans..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            ${showTypeFilter ? `{/* Loan Type */}
            <div className="${layout === 'horizontal' ? 'min-w-[150px]' : 'w-full'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loan Type
              </label>
              <select
                value={currentFilters.loanType}
                onChange={(e) => updateFilter('loanType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Types</option>
                {loanTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showPurposeFilter ? `{/* Purpose */}
            <div className="${layout === 'horizontal' ? 'min-w-[150px]' : 'w-full'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purpose
              </label>
              <select
                value={currentFilters.purpose}
                onChange={(e) => updateFilter('purpose', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Purposes</option>
                {loanPurposes.map(purpose => (
                  <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                ))}
              </select>
            </div>` : ''}

            ${showStatusFilter ? `{/* Status */}
            <div className="${layout === 'horizontal' ? 'min-w-[150px]' : 'w-full'}">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={currentFilters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                {loanStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>` : ''}
          </div>

          {/* Range Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            ${showAmountFilter ? `{/* Loan Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Loan Amount
                </div>
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentFilters.amountMin}
                    onChange={(e) => updateFilter('amountMin', Number(e.target.value))}
                    min={${minAmount}}
                    max={currentFilters.amountMax}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={currentFilters.amountMax}
                    onChange={(e) => updateFilter('amountMax', Number(e.target.value))}
                    min={currentFilters.amountMin}
                    max={${maxAmount}}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Max"
                  />
                </div>
                <input
                  type="range"
                  min={${minAmount}}
                  max={${maxAmount}}
                  step={1000}
                  value={currentFilters.amountMax}
                  onChange={(e) => updateFilter('amountMax', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(${minAmount})}</span>
                  <span>{formatCurrency(${maxAmount})}</span>
                </div>
              </div>
            </div>` : ''}

            ${showTermFilter ? `{/* Loan Term Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Loan Term
                </div>
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <select
                    value={currentFilters.termMin}
                    onChange={(e) => updateFilter('termMin', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    {[6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360].filter(t => t >= ${minTerm}).map(term => (
                      <option key={term} value={term}>{formatTerm(term)}</option>
                    ))}
                  </select>
                  <span className="text-gray-400">-</span>
                  <select
                    value={currentFilters.termMax}
                    onChange={(e) => updateFilter('termMax', Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    {[6, 12, 24, 36, 48, 60, 84, 120, 180, 240, 360].filter(t => t <= ${maxTerm} && t >= currentFilters.termMin).map(term => (
                      <option key={term} value={term}>{formatTerm(term)}</option>
                    ))}
                  </select>
                </div>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {formatTerm(currentFilters.termMin)} to {formatTerm(currentFilters.termMax)}
                </div>
              </div>
            </div>` : ''}

            ${showRateFilter ? `{/* Interest Rate Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Interest Rate (APR)
                </div>
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentFilters.rateMin}
                    onChange={(e) => updateFilter('rateMin', Number(e.target.value))}
                    min={0}
                    max={currentFilters.rateMax}
                    step={0.1}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Min %"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={currentFilters.rateMax}
                    onChange={(e) => updateFilter('rateMax', Number(e.target.value))}
                    min={currentFilters.rateMin}
                    max={30}
                    step={0.1}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder="Max %"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={currentFilters.rateMax}
                  onChange={(e) => updateFilter('rateMax', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>` : ''}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              disabled={!hasActiveFilters}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Filters
            </button>
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
      )}
    </div>
  );
};

export default ${componentName};
`;
}

/**
 * Generate loan calculator component
 */
export function generateLoanCalculator(options: Partial<LoanFiltersOptions> = {}): string {
  const componentName = 'LoanCalculator';

  return `import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Calendar, Percent, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ${componentName}Props {
  className?: string;
  defaultAmount?: number;
  defaultTerm?: number;
  defaultRate?: number;
  onCalculate?: (result: CalculationResult) => void;
}

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  principal: number;
  rate: number;
  term: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  className,
  defaultAmount = 25000,
  defaultTerm = 60,
  defaultRate = 7.5,
  onCalculate,
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [term, setTerm] = useState(defaultTerm);
  const [rate, setRate] = useState(defaultRate);

  const calculation = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const numPayments = term;

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = amount / numPayments;
    } else {
      monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - amount;

    const result = {
      monthlyPayment,
      totalPayment,
      totalInterest,
      principal: amount,
      rate,
      term,
    };

    if (onCalculate) onCalculate(result);
    return result;
  }, [amount, term, rate, onCalculate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6',
      className
    )}>
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Loan Calculator</h2>
      </div>

      <div className="space-y-6">
        {/* Loan Amount */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4" />
            Loan Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1000}
            max={1000000}
            step={1000}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg"
          />
          <input
            type="range"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1000}
            max={500000}
            step={1000}
            className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Loan Term */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4" />
            Loan Term (months)
          </label>
          <select
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg"
          >
            <option value={12}>12 months (1 year)</option>
            <option value={24}>24 months (2 years)</option>
            <option value={36}>36 months (3 years)</option>
            <option value={48}>48 months (4 years)</option>
            <option value={60}>60 months (5 years)</option>
            <option value={72}>72 months (6 years)</option>
            <option value={84}>84 months (7 years)</option>
            <option value={120}>120 months (10 years)</option>
            <option value={180}>180 months (15 years)</option>
            <option value={240}>240 months (20 years)</option>
            <option value={360}>360 months (30 years)</option>
          </select>
        </div>

        {/* Interest Rate */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Percent className="w-4 h-4" />
            Interest Rate (APR)
          </label>
          <div className="relative">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              min={0}
              max={30}
              step={0.1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
          </div>
          <input
            type="range"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            min={0}
            max={30}
            step={0.25}
            className="w-full mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Payment</p>
          <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(calculation.monthlyPayment)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Payment</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(calculation.totalPayment)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Interest</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(calculation.totalInterest)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
        <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
        This calculator provides estimates only. Actual loan terms may vary based on credit score, income, and other factors.
      </p>
    </div>
  );
};

export default ${componentName};
`;
}
