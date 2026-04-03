import React from 'react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Wheat, Dumbbell, Droplet, PieChart } from 'lucide-react';

interface MacroData {
  current: number;
  target: number;
}

interface MacroBreakdownProps {
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
}

const MacroBreakdown: React.FC<MacroBreakdownProps> = ({
  protein,
  carbs,
  fat
}) => {
  const macronutrients = [
    {
      name: 'Carbohydrates',
      consumed: carbs.current,
      goal: carbs.target,
      unit: 'g',
      color: 'emerald',
      icon: Wheat,
      calories: carbs.current * 4
    },
    {
      name: 'Protein',
      consumed: protein.current,
      goal: protein.target,
      unit: 'g',
      color: 'blue',
      icon: Dumbbell,
      calories: protein.current * 4
    },
    {
      name: 'Fat',
      consumed: fat.current,
      goal: fat.target,
      unit: 'g',
      color: 'orange',
      icon: Droplet,
      calories: fat.current * 9
    }
  ];

  const getProgressPercentage = (consumed: number, goal: number) => {
    return Math.min((consumed / goal) * 100, 100);
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500';
      case 'blue':
        return 'bg-blue-500';
      case 'orange':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (consumed: number, goal: number) => {
    const percentage = (consumed / goal) * 100;
    if (percentage < 80) return 'text-orange-400';
    if (percentage > 120) return 'text-red-400';
    return 'text-emerald-400';
  };

  const totalCalories = macronutrients.reduce((sum, m) => sum + m.calories, 0);

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-lg">
              <PieChart className="h-6 w-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Macronutrients</h3>
              <p className="text-sm text-white/60">Today's macro breakdown</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {macronutrients.map((macro, index) => {
            const progress = getProgressPercentage(macro.consumed, macro.goal);
            const remaining = Math.max(macro.goal - macro.consumed, 0);
            const IconComponent = macro.icon;
            
            const getIconBgColor = (color: string) => {
              switch (color) {
                case 'emerald': return 'bg-emerald-500/20';
                case 'blue': return 'bg-blue-500/20';
                case 'orange': return 'bg-orange-500/20';
                default: return 'bg-white/10';
              }
            };

            const getIconTextColor = (color: string) => {
              switch (color) {
                case 'emerald': return 'text-emerald-400';
                case 'blue': return 'text-blue-400';
                case 'orange': return 'text-orange-400';
                default: return 'text-white/60';
              }
            };

            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getIconBgColor(macro.color)}`}>
                      <IconComponent className={`h-5 w-5 ${getIconTextColor(macro.color)}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{macro.name}</h4>
                      <p className="text-xs text-white/60">
                        {macro.calories} calories
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${getStatusColor(macro.consumed, macro.goal)}`}>
                      {macro.consumed}{macro.unit}
                    </p>
                    <p className="text-xs text-white/60">
                      of {macro.goal}{macro.unit}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">
                      Progress: {progress.toFixed(0)}%
                    </span>
                    <span className={`text-xs font-medium ${getStatusColor(macro.consumed, macro.goal)}`}>
                      {remaining > 0 ? `${remaining.toFixed(0)}${macro.unit} left` : 'Goal reached'}
                    </span>
                  </div>

                  <div className="relative">
                    <Progress
                      value={progress}
                      className="h-2"
                    />
                    {macro.consumed > macro.goal && (
                      <div className="absolute inset-0 h-2 bg-red-500/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(((macro.consumed / macro.goal) - 1) * 100, 50)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            {macronutrients.map((macro, index) => {
              const getTextColor = (color: string) => {
                switch (color) {
                  case 'emerald': return 'text-emerald-400';
                  case 'blue': return 'text-blue-400';
                  case 'orange': return 'text-orange-400';
                  default: return 'text-white';
                }
              };

              return (
                <div key={index} className="space-y-1">
                  <p className={`text-lg font-bold ${getTextColor(macro.color)}`}>
                    {totalCalories > 0 ? Math.round((macro.calories / totalCalories) * 100) : 0}%
                  </p>
                  <p className="text-xs text-white/60">
                    of calories
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MacroBreakdown;