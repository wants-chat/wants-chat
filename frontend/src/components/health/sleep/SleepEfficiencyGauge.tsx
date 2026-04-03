import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { cn } from '../../../lib/utils';

interface SleepEfficiencyGaugeProps {
  efficiency: number;
  targetEfficiency?: number;
  size?: 'sm' | 'md' | 'lg';
  showCard?: boolean;
  className?: string;
}

export const SleepEfficiencyGauge: React.FC<SleepEfficiencyGaugeProps> = ({
  efficiency,
  targetEfficiency = 85,
  size = 'md',
  showCard = true,
  className,
}) => {
  const normalizedEfficiency = Math.min(100, Math.max(0, efficiency));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (normalizedEfficiency / 100) * circumference;

  const getEfficiencyColor = (value: number) => {
    if (value >= 85) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'from-emerald-500 to-green-500' };
    if (value >= 75) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'from-amber-500 to-yellow-500' };
    return { stroke: '#ef4444', text: 'text-red-400', bg: 'from-red-500 to-rose-500' };
  };

  const getEfficiencyLabel = (value: number) => {
    if (value >= 90) return 'Excellent';
    if (value >= 85) return 'Good';
    if (value >= 75) return 'Fair';
    if (value >= 60) return 'Poor';
    return 'Very Poor';
  };

  const colors = getEfficiencyColor(normalizedEfficiency);
  const label = getEfficiencyLabel(normalizedEfficiency);

  const sizeConfig = {
    sm: { width: 100, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { width: 140, fontSize: 'text-2xl', labelSize: 'text-sm' },
    lg: { width: 180, fontSize: 'text-3xl', labelSize: 'text-base' },
  };

  const config = sizeConfig[size];

  const GaugeContent = () => (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg
          className="transform -rotate-90"
          width={config.width}
          height={config.width}
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          {/* Target indicator */}
          {targetEfficiency && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
              strokeDasharray={`${(targetEfficiency / 100) * circumference} ${circumference}`}
              strokeLinecap="round"
            />
          )}
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold text-white', config.fontSize)}>
            {Math.round(normalizedEfficiency)}%
          </span>
          <span className={cn(colors.text, config.labelSize, 'font-medium')}>
            {label}
          </span>
        </div>
      </div>
      {targetEfficiency && (
        <p className="text-xs text-white/50 text-center">
          Target: {targetEfficiency}%
        </p>
      )}
    </div>
  );

  if (!showCard) {
    return <GaugeContent />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Sleep Efficiency</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <GaugeContent />
      </CardContent>
    </Card>
  );
};

export default SleepEfficiencyGauge;
