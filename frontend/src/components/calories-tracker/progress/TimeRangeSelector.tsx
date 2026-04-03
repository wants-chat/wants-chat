import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface TimeRangeSelectorProps {
  selected: 'week' | 'month' | '3months' | 'year';
  onChange: (range: 'week' | 'month' | '3months' | 'year') => void;
}

const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selected,
  onChange
}) => {
  const ranges: Array<{ value: 'week' | 'month' | '3months' | 'year'; label: string }> = [
    { value: 'week', label: '1W' },
    { value: 'month', label: '1M' },
    { value: '3months', label: '3M' },
    { value: 'year', label: '1Y' }
  ];

  return (
    <Card className="p-4 bg-white/5 border border-white/10">
      <div className="flex justify-center gap-2">
        {ranges.map((range) => (
          <Button
            key={range.value}
            size="sm"
            onClick={() => onChange(range.value)}
            className={`${
              selected === range.value
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-transparent'
                : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default TimeRangeSelector;