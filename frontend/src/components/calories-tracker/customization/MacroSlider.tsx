import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { mdiAlert, mdiCheckCircle, mdiInformation } from '@mdi/js';

interface MacroSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  color: 'emerald' | 'blue' | 'orange';
  grams: number;
  recommendation?: {
    status: 'good' | 'warning' | 'error';
    text: string;
  };
}

const MacroSlider: React.FC<MacroSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  color,
  grams,
  recommendation
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-500',
          text: 'text-emerald-600',
          border: 'border-emerald-200',
          light: 'bg-emerald-50'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          border: 'border-blue-200',
          light: 'bg-blue-50'
        };
      case 'orange':
        return {
          bg: 'bg-orange-500',
          text: 'text-orange-600',
          border: 'border-orange-200',
          light: 'bg-orange-50'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          border: 'border-gray-200',
          light: 'bg-gray-50'
        };
    }
  };

  const getRecommendationIcon = (status: string) => {
    switch (status) {
      case 'good':
        return mdiCheckCircle;
      case 'warning':
        return mdiAlert;
      case 'error':
        return mdiAlert;
      default:
        return mdiInformation;
    }
  };

  const getRecommendationColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600';
      case 'warning':
        return 'text-orange-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const colors = getColorClasses(color);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">{label}</h3>
          <p className="text-sm text-muted-foreground">{grams}g per day</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${colors.text}`}>{value.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">of calories</p>
        </div>
      </div>

      {/* Custom Slider */}
      <div className="relative">
        <div className="h-3 bg-secondary rounded-full">
          <div
            className={`h-3 ${colors.bg} rounded-full transition-all duration-300`}
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
          step="0.5"
        />
        
        {/* Slider thumb indicator */}
        <div
          className={`absolute top-1/2 w-6 h-6 ${colors.bg} rounded-full border-2 border-white shadow-lg transform -translate-y-1/2 -translate-x-1/2 transition-all duration-300`}
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
        />
      </div>

      {/* Range indicators */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}%</span>
        <span>{max}%</span>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/20">
          <Icon 
            path={getRecommendationIcon(recommendation.status)} 
            size={0.7} 
            className={`mt-0.5 flex-shrink-0 ${getRecommendationColor(recommendation.status)}`} 
          />
          <p className="text-sm text-foreground">{recommendation.text}</p>
        </div>
      )}

      {/* Quick adjustment buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 5))}
          className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          -5%
        </button>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          -1%
        </button>
        <div className="flex-1" />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          +1%
        </button>
        <button
          onClick={() => onChange(Math.min(max, value + 5))}
          className="px-3 py-1 text-xs bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          +5%
        </button>
      </div>
    </div>
  );
};

export default MacroSlider;