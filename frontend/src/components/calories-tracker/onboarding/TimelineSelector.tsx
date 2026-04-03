import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import {
  mdiSpeedometer,
  mdiTortoise,
  mdiRabbit,
  mdiRocket,
  mdiAlert,
  mdiScaleBalance
} from '@mdi/js';

interface TimelineSelectorProps {
  selectedTimeline: number | null;
  onTimelineSelect: (timeline: 0.5 | 1 | 1.5 | 2) => void;
  goal: string;
}

const TimelineSelector: React.FC<TimelineSelectorProps> = ({
  selectedTimeline,
  onTimelineSelect,
  goal
}) => {
  const getTimelineOptions = () => {
    if (goal === 'lose_weight') {
      return [
        {
          value: 0.5 as const,
          title: 'Conservative',
          subtitle: '0.5 kg per week',
          description: 'Gradual weight loss with minimal lifestyle changes',
          deficit: '385 calories/day',
          duration: 'Longer timeline, easier to maintain',
          icon: mdiTortoise,
          iconColor: 'text-emerald-400',
          badge: 'Recommended',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        },
        {
          value: 1 as const,
          title: 'Moderate',
          subtitle: '1 kg per week',
          description: 'Balanced approach with steady progress',
          deficit: '770 calories/day',
          duration: 'Good balance of speed and sustainability',
          icon: mdiSpeedometer,
          iconColor: 'text-blue-400',
          badge: 'Popular',
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        },
        {
          value: 1.5 as const,
          title: 'Aggressive',
          subtitle: '1.5 kg per week',
          description: 'Faster results requiring more discipline',
          deficit: '1,155 calories/day',
          duration: 'Requires significant lifestyle changes',
          icon: mdiRabbit,
          iconColor: 'text-orange-400',
          badge: 'Challenging',
          badgeColor: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
        },
        {
          value: 2 as const,
          title: 'Very Aggressive',
          subtitle: '2 kg per week',
          description: 'Maximum safe weight loss rate',
          deficit: '1,540 calories/day',
          duration: 'Only recommended for short periods',
          icon: mdiRocket,
          iconColor: 'text-red-400',
          badge: 'Expert Only',
          badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30'
        }
      ];
    } else if (goal === 'gain_weight') {
      return [
        {
          value: 0.5 as const,
          title: 'Lean Gains',
          subtitle: '0.5 kg per week',
          description: 'Minimize fat gain while building muscle',
          deficit: '385 calories/day surplus',
          duration: 'Optimal for muscle building',
          icon: mdiTortoise,
          iconColor: 'text-emerald-400',
          badge: 'Recommended',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        },
        {
          value: 1 as const,
          title: 'Moderate Gains',
          subtitle: '1 kg per week',
          description: 'Balanced weight gain with some fat',
          deficit: '770 calories/day surplus',
          duration: 'Good for underweight individuals',
          icon: mdiSpeedometer,
          iconColor: 'text-blue-400',
          badge: 'Balanced',
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }
      ];
    } else {
      // For maintain_weight or build_muscle
      return [
        {
          value: 0.5 as const,
          title: 'Maintenance',
          subtitle: 'Maintain current weight',
          description: 'Focus on body composition improvements',
          deficit: 'No calorie adjustment',
          duration: 'Long-term sustainable approach',
          icon: mdiScaleBalance,
          iconColor: 'text-blue-400',
          badge: 'Steady',
          badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
        }
      ];
    }
  };

  const timelineOptions = getTimelineOptions();

  const getGoalText = () => {
    switch (goal) {
      case 'lose_weight':
        return 'How fast do you want to lose weight?';
      case 'gain_weight':
        return 'How fast do you want to gain weight?';
      case 'build_muscle':
        return 'What\'s your approach to building muscle?';
      case 'maintain_weight':
        return 'How do you want to maintain your weight?';
      default:
        return 'Select your timeline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          {getGoalText()}
        </h2>
        <p className="text-white/60">
          This determines your daily calorie target
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {timelineOptions.map((option) => (
          <Card
            key={option.value}
            className={`
              p-6 cursor-pointer transition-all duration-300 border-2
              ${selectedTimeline === option.value
                ? 'border-teal-400 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 shadow-xl shadow-teal-500/30 scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }
            `}
            onClick={() => onTimelineSelect(option.value)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedTimeline === option.value
                      ? 'bg-teal-500/40'
                      : 'bg-white/10'
                  }`}>
                    <Icon
                      path={option.icon}
                      size={1.2}
                      className={selectedTimeline === option.value ? 'text-teal-300' : option.iconColor}
                    />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${selectedTimeline === option.value ? 'text-teal-300' : 'text-white'}`}>
                      {option.title}
                    </h3>
                    <p className={`text-sm font-medium ${selectedTimeline === option.value ? 'text-white/80' : 'text-white/60'}`}>
                      {option.subtitle}
                    </p>
                  </div>
                </div>

                <Badge className={option.badgeColor}>
                  {option.badge}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className={`text-sm ${selectedTimeline === option.value ? 'text-white' : 'text-white/80'}`}>
                  {option.description}
                </p>

                <div className="space-y-1 text-xs text-white/60">
                  <p><strong className="text-white/80">Calorie adjustment:</strong> {option.deficit}</p>
                  <p><strong className="text-white/80">Timeline:</strong> {option.duration}</p>
                </div>
              </div>

              {selectedTimeline === option.value && (
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-teal-400">Selected</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {goal === 'lose_weight' && (
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
          <div className="flex items-start gap-3">
            <Icon path={mdiAlert} size={1} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400">
                Important Safety Information
              </p>
              <div className="text-xs text-white/70 space-y-1">
                <p>• Don't go below 1,200 calories/day (women) or 1,500 calories/day (men)</p>
                <p>• Rapid weight loss may cause muscle loss, nutritional deficiencies, and metabolic slowdown</p>
                <p>• Consult a healthcare professional before starting aggressive weight loss plans</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-teal-500/10 p-4 rounded-lg border border-teal-500/20">
        <p className="text-sm text-white/80">
          <strong className="text-teal-400">Remember:</strong> Consistency is more important than speed. Choose a timeline
          you can stick to long-term for the best results.
        </p>
      </div>
    </div>
  );
};

export default TimelineSelector;