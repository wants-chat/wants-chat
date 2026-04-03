import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiTarget,
  mdiWeight,
  mdiDumbbell,
  mdiCalendar,
  mdiPlus
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';

interface Goal {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  progress: number;
  status: string;
  timeRemaining?: string;
  icon: string;
  color: string;
}

interface GoalsProgressProps {
  goals: Goal[];
  onAddGoal?: () => void;
}

const GoalsProgress: React.FC<GoalsProgressProps> = ({ goals, onAddGoal }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'weight': return mdiWeight;
      case 'strength': return mdiDumbbell;
      case 'consistency': return mdiCalendar;
      default: return mdiTarget;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          badge: 'bg-teal-500/20 text-teal-400',
          progress: 'bg-gradient-to-r from-teal-500 to-cyan-400',
          icon: 'text-teal-400'
        };
      case 'emerald':
        return {
          badge: 'bg-emerald-500/20 text-emerald-400',
          progress: 'bg-gradient-to-r from-emerald-500 to-green-400',
          icon: 'text-emerald-400'
        };
      case 'purple':
        return {
          badge: 'bg-purple-500/20 text-purple-400',
          progress: 'bg-gradient-to-r from-purple-500 to-pink-400',
          icon: 'text-purple-400'
        };
      default:
        return {
          badge: 'bg-white/10 text-white/60',
          progress: 'bg-gradient-to-r from-gray-400 to-gray-500',
          icon: 'text-white/60'
        };
    }
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiTarget} size={1} className="text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Goal Progress</h3>
        </div>
        {onAddGoal && (
          <Button size="sm" onClick={onAddGoal} className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600">
            <Icon path={mdiPlus} size={0.7} className="mr-2" />
            Add Goal
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {goals.map((goal) => {
          const colorClasses = getColorClasses(goal.color);
          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon path={getIcon(goal.icon)} size={0.7} className={colorClasses.icon} />
                  <span className="font-medium text-white">{goal.title}</span>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${colorClasses.badge}`}>
                  {goal.progress.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colorClasses.progress} rounded-full transition-all duration-500`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>{goal.current} / {goal.target} {goal.unit}</span>
                <span className={`font-medium ${
                  goal.status === 'On track' ? 'text-emerald-400' :
                  goal.status === 'Almost there' ? 'text-orange-400' :
                  goal.status === 'Excellent' ? 'text-emerald-400' :
                  'text-white/60'
                }`}>
                  {goal.status}
                </span>
              </div>
              {goal.timeRemaining && (
                <p className="text-xs text-white/60">{goal.timeRemaining}</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default GoalsProgress;