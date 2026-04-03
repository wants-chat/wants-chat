import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { 
  mdiSofa,
  mdiWalk,
  mdiBike,
  mdiRun,
  mdiDumbbell
} from '@mdi/js';

interface ActivityLevelPickerProps {
  selectedLevel: string;
  onLevelSelect: (level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active') => void;
}

const ActivityLevelPicker: React.FC<ActivityLevelPickerProps> = ({
  selectedLevel,
  onLevelSelect
}) => {
  const activityLevels = [
    {
      id: 'sedentary' as const,
      title: 'Sedentary',
      description: 'Little or no exercise, desk job',
      examples: 'Office work, watching TV, reading',
      multiplier: '1.2x BMR',
      icon: mdiSofa,
      iconColor: 'text-gray-400'
    },
    {
      id: 'lightly_active' as const,
      title: 'Lightly Active',
      description: 'Light exercise 1-3 days/week',
      examples: 'Walking, light yoga, casual sports',
      multiplier: '1.375x BMR',
      icon: mdiWalk,
      iconColor: 'text-blue-400'
    },
    {
      id: 'moderately_active' as const,
      title: 'Moderately Active',
      description: 'Moderate exercise 3-5 days/week',
      examples: 'Jogging, swimming, cycling',
      multiplier: '1.55x BMR',
      icon: mdiBike,
      iconColor: 'text-emerald-400'
    },
    {
      id: 'very_active' as const,
      title: 'Very Active',
      description: 'Hard exercise 6-7 days/week',
      examples: 'Daily runs, intense gym sessions',
      multiplier: '1.725x BMR',
      icon: mdiRun,
      iconColor: 'text-orange-400'
    },
    {
      id: 'extremely_active' as const,
      title: 'Extremely Active',
      description: 'Very hard exercise, physical job',
      examples: 'Athletic training, construction work',
      multiplier: '1.9x BMR',
      icon: mdiDumbbell,
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          How active are you?
        </h2>
        <p className="text-white/60">
          This helps us calculate your Total Daily Energy Expenditure (TDEE)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activityLevels.map((level) => (
          <Card
            key={level.id}
            className={`
              p-6 cursor-pointer transition-all duration-300 border-2
              ${selectedLevel === level.id
                ? 'border-teal-400 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 shadow-xl shadow-teal-500/30 scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }
            `}
            onClick={() => onLevelSelect(level.id)}
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className={`inline-flex p-4 rounded-xl mb-3 ${
                  selectedLevel === level.id
                    ? 'bg-teal-500/40'
                    : 'bg-white/10'
                }`}>
                  <Icon
                    path={level.icon}
                    size={2}
                    className={selectedLevel === level.id ? 'text-teal-300' : level.iconColor}
                  />
                </div>

                <h3 className={`text-lg font-semibold mb-1 ${selectedLevel === level.id ? 'text-teal-300' : 'text-white'}`}>
                  {level.title}
                </h3>

                <p className={`text-sm font-medium mb-2 ${selectedLevel === level.id ? 'text-white/80' : 'text-white/60'}`}>
                  {level.multiplier}
                </p>
              </div>

              <div className="space-y-2">
                <p className={`text-sm font-medium ${selectedLevel === level.id ? 'text-white' : 'text-white/80'}`}>
                  {level.description}
                </p>

                <p className="text-xs text-white/60">
                  Examples: {level.examples}
                </p>
              </div>

              {selectedLevel === level.id && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-teal-400">Selected</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-cyan-500/10 p-4 rounded-lg border border-cyan-500/20">
        <div className="space-y-2">
          <p className="text-sm font-medium text-cyan-300">
            How is this calculated?
          </p>
          <p className="text-xs text-white/70">
            Your TDEE (Total Daily Energy Expenditure) = BMR × Activity Level Multiplier.
            This represents the total calories you burn in a day including exercise and daily activities.
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
        <p className="text-sm text-white/80">
          <strong className="text-amber-400">Tip:</strong> Be honest about your activity level. It's better to underestimate
          slightly than overestimate, as this affects your daily calorie target.
        </p>
      </div>
    </div>
  );
};

export default ActivityLevelPicker;