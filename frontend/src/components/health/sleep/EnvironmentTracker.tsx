import React from 'react';
import { Volume2, Sun, Thermometer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import type { NoiseLevel, LightLevel, TemperatureComfort } from '../../../types/health/sleep';

interface EnvironmentTrackerProps {
  noiseLevel?: NoiseLevel;
  lightLevel?: LightLevel;
  temperatureComfort?: TemperatureComfort;
  onNoiseChange?: (level: NoiseLevel) => void;
  onLightChange?: (level: LightLevel) => void;
  onTemperatureChange?: (level: TemperatureComfort) => void;
  readOnly?: boolean;
  compact?: boolean;
}

const noiseLevels: { value: NoiseLevel; label: string; icon: string }[] = [
  { value: 'silent', label: 'Silent', icon: '🔇' },
  { value: 'quiet', label: 'Quiet', icon: '🔈' },
  { value: 'moderate', label: 'Moderate', icon: '🔉' },
  { value: 'loud', label: 'Loud', icon: '🔊' },
];

const lightLevels: { value: LightLevel; label: string; icon: string }[] = [
  { value: 'dark', label: 'Dark', icon: '🌑' },
  { value: 'dim', label: 'Dim', icon: '🌙' },
  { value: 'moderate', label: 'Moderate', icon: '🌤️' },
  { value: 'bright', label: 'Bright', icon: '☀️' },
];

const temperatureLevels: { value: TemperatureComfort; label: string; icon: string }[] = [
  { value: 'cold', label: 'Cold', icon: '🥶' },
  { value: 'cool', label: 'Cool', icon: '❄️' },
  { value: 'comfortable', label: 'Comfortable', icon: '✅' },
  { value: 'warm', label: 'Warm', icon: '🌡️' },
  { value: 'hot', label: 'Hot', icon: '🔥' },
];

export const EnvironmentTracker: React.FC<EnvironmentTrackerProps> = ({
  noiseLevel,
  lightLevel,
  temperatureComfort,
  onNoiseChange,
  onLightChange,
  onTemperatureChange,
  readOnly = false,
  compact = false,
}) => {
  const EnvironmentSection = ({
    title,
    icon: Icon,
    options,
    value,
    onChange,
  }: {
    title: string;
    icon: React.ElementType;
    options: { value: string; label: string; icon: string }[];
    value?: string;
    onChange?: (value: any) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Icon className="w-4 h-4" />
        <span>{title}</span>
      </div>
      <div className={cn('flex flex-wrap gap-2', compact && 'gap-1')}>
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? 'default' : 'outline'}
            size={compact ? 'sm' : 'default'}
            className={cn(
              'transition-all',
              value === option.value
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 border-transparent'
                : 'border-white/20 hover:border-white/40',
              readOnly && 'pointer-events-none'
            )}
            onClick={() => onChange?.(option.value)}
            disabled={readOnly}
          >
            <span className="mr-1">{option.icon}</span>
            {!compact && <span>{option.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );

  if (compact && readOnly) {
    return (
      <div className="flex items-center gap-3 text-sm">
        {noiseLevel && (
          <span className="flex items-center gap-1 text-white/70">
            <Volume2 className="w-3 h-3" />
            {noiseLevels.find((n) => n.value === noiseLevel)?.icon}
          </span>
        )}
        {lightLevel && (
          <span className="flex items-center gap-1 text-white/70">
            <Sun className="w-3 h-3" />
            {lightLevels.find((l) => l.value === lightLevel)?.icon}
          </span>
        )}
        {temperatureComfort && (
          <span className="flex items-center gap-1 text-white/70">
            <Thermometer className="w-3 h-3" />
            {temperatureLevels.find((t) => t.value === temperatureComfort)?.icon}
          </span>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sleep Environment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EnvironmentSection
          title="Noise Level"
          icon={Volume2}
          options={noiseLevels}
          value={noiseLevel}
          onChange={onNoiseChange}
        />
        <EnvironmentSection
          title="Light Level"
          icon={Sun}
          options={lightLevels}
          value={lightLevel}
          onChange={onLightChange}
        />
        <EnvironmentSection
          title="Temperature"
          icon={Thermometer}
          options={temperatureLevels}
          value={temperatureComfort}
          onChange={onTemperatureChange}
        />
      </CardContent>
    </Card>
  );
};

export default EnvironmentTracker;
