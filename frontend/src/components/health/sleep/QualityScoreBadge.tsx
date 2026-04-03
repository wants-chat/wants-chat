import React from 'react';
import { cn } from '../../../lib/utils';
import { getQualityScoreColor, getQualityScoreLabel } from '../../../types/health/sleep';

interface QualityScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const QualityScoreBadge: React.FC<QualityScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const color = getQualityScoreColor(score);
  const label = getQualityScoreLabel(score);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-24 h-24 text-xl',
  };

  const colorClasses = {
    green: 'from-green-500 to-emerald-500 text-white',
    yellow: 'from-yellow-500 to-amber-500 text-white',
    red: 'from-red-500 to-rose-500 text-white',
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div
        className={cn(
          'rounded-full bg-gradient-to-br flex items-center justify-center font-bold shadow-lg',
          sizeClasses[size],
          colorClasses[color]
        )}
      >
        {score}
      </div>
      {showLabel && (
        <span
          className={cn(
            'text-xs font-medium',
            color === 'green' && 'text-green-400',
            color === 'yellow' && 'text-yellow-400',
            color === 'red' && 'text-red-400'
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default QualityScoreBadge;
