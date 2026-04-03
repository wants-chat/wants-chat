import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { 
  mdiTrendingDown,
  mdiTrendingUp,
  mdiScaleBalance,
  mdiDumbbell
} from '@mdi/js';

interface GoalSelectorProps {
  selectedGoal: string;
  onGoalSelect: (goal: 'lose_weight' | 'gain_weight' | 'maintain_weight' | 'gain_muscle') => void;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({
  selectedGoal,
  onGoalSelect
}) => {
  const goals = [
    {
      id: 'lose_weight' as const,
      title: 'Lose Weight',
      description: 'Create a calorie deficit to shed unwanted pounds',
      icon: mdiTrendingDown,
      iconColor: 'text-red-400'
    },
    {
      id: 'gain_weight' as const,
      title: 'Gain Weight',
      description: 'Build healthy weight through controlled surplus',
      icon: mdiTrendingUp,
      iconColor: 'text-emerald-400'
    },
    {
      id: 'maintain_weight' as const,
      title: 'Maintain Weight',
      description: 'Keep your current weight with balanced nutrition',
      icon: mdiScaleBalance,
      iconColor: 'text-blue-400'
    },
    {
      id: 'gain_muscle' as const,
      title: 'Build Muscle',
      description: 'Optimize nutrition for lean muscle growth',
      icon: mdiDumbbell,
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-white mb-2">
          What's your primary goal?
        </h2>
        <p className="text-white/60">
          This will help us calculate your optimal calorie target
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <Card
            key={goal.id}
            className={`
              p-6 cursor-pointer transition-all duration-300 border-2
              ${selectedGoal === goal.id
                ? 'border-teal-400 bg-gradient-to-br from-teal-500/30 to-cyan-500/30 shadow-xl shadow-teal-500/30 scale-[1.02]'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }
            `}
            onClick={() => onGoalSelect(goal.id)}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  selectedGoal === goal.id
                    ? 'bg-teal-500/40'
                    : 'bg-white/10'
                }`}>
                  <Icon
                    path={goal.icon}
                    size={1.2}
                    className={selectedGoal === goal.id ? 'text-teal-300' : goal.iconColor}
                  />
                </div>
                <h3 className={`text-lg font-semibold ${selectedGoal === goal.id ? 'text-teal-300' : 'text-white'}`}>
                  {goal.title}
                </h3>
              </div>

              <p className={`text-sm ${selectedGoal === goal.id ? 'text-white/80' : 'text-white/60'}`}>
                {goal.description}
              </p>

              {selectedGoal === goal.id && (
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-teal-400">Selected</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-teal-500/10 p-4 rounded-lg border border-teal-500/20">
        <p className="text-sm text-white/80">
          <strong className="text-teal-400">Tip:</strong> You can always change your goal later in your profile settings.
          We'll adjust your calorie targets accordingly.
        </p>
      </div>
    </div>
  );
};

export default GoalSelector;