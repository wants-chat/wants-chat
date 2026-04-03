import React from 'react';
import { Progress } from '../../ui/progress';

interface NutritionRingProps {
  current: number;
  goal: number;
  label: string;
  unit: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

const NutritionRing: React.FC<NutritionRingProps> = ({
  current,
  goal,
  label,
  unit,
  color = 'primary',
  size = 'md',
  showPercentage = true
}) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOverGoal = current > goal;
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const getColorClasses = () => {
    if (isOverGoal) {
      return 'text-destructive';
    }
    
    switch (color) {
      case 'emerald':
        return 'text-emerald-600';
      case 'blue':
        return 'text-blue-600';
      case 'orange':
        return 'text-orange-600';
      case 'purple':
        return 'text-purple-600';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="text-center space-y-2">
      {/* Circular Progress */}
      <div className={`${sizeClasses[size]} relative mx-auto`}>
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.51327} 251.327`}
            className={getColorClasses()}
            style={{
              transition: 'stroke-dasharray 0.5s ease-in-out'
            }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${textSizeClasses[size]} text-foreground`}>
            {current}
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground">
              / {goal}
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="space-y-1">
        <p className={`font-medium text-foreground ${textSizeClasses[size]}`}>
          {label}
        </p>
        <p className="text-xs text-muted-foreground">
          {current}{unit} / {goal}{unit}
        </p>
        {showPercentage && (
          <p className={`text-xs font-medium ${getColorClasses()}`}>
            {percentage.toFixed(0)}%
          </p>
        )}
      </div>
    </div>
  );
};

export default NutritionRing;