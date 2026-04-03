import React from 'react';
import { Button } from '../../ui/button';
import { PlanDuration } from '../../../types/fitness';

type Period = '7d' | '1m' | '3m' | '6m' | '1y';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onPeriodChange: (period: Period) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  const periods: { value: Period; label: string }[] = [
    { value: '7d', label: '7D' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' }
  ];

  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
      <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-1">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPeriodChange(period.value)}
            className={selectedPeriod === period.value ? 'bg-primary text-white' : ''}
          >
            {period.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;