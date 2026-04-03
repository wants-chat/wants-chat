import React from 'react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { mdiTrendingDown } from '@mdi/js';

interface GoalProgressProps {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
}

const GoalProgress: React.FC<GoalProgressProps> = ({
  currentWeight,
  startWeight,
  goalWeight
}) => {
  const totalToLose = startWeight - goalWeight;
  const alreadyLost = startWeight - currentWeight;
  const progress = totalToLose > 0 ? Math.min(Math.max((alreadyLost / totalToLose) * 100, 0), 100) : 0;
  const remaining = Math.max(currentWeight - goalWeight, 0);
  
  // Determine if this is weight loss or weight gain goal
  const isWeightLoss = goalWeight < startWeight;
  const isGoalReached = isWeightLoss ? currentWeight <= goalWeight : currentWeight >= goalWeight;

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${isGoalReached ? 'bg-emerald-500/20' : 'bg-teal-500/20'}`}>
            <Icon
              path={mdiTrendingDown}
              size={1}
              className={isGoalReached ? 'text-emerald-400' : 'text-teal-400'}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {isWeightLoss ? 'Weight Loss Goal' : 'Weight Gain Goal'}
            </h3>
            <p className="text-sm text-white/60">
              {isGoalReached
                ? '🎉 Goal reached! Great job!'
                : `${remaining.toFixed(1)}kg ${isWeightLoss ? 'to lose' : 'to gain'}`
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Progress</span>
            <span className={`font-medium ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>
              {Math.round(progress)}%
            </span>
          </div>
          <Progress
            value={progress}
            className={`h-3 bg-white/10 ${isGoalReached ? '[&>div]:bg-emerald-500' : '[&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-cyan-500'}`}
          />
          {alreadyLost > 0 && (
            <p className="text-xs text-center text-white/60">
              {isWeightLoss ? 'Lost' : 'Gained'}: {Math.abs(alreadyLost).toFixed(1)}kg
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-2xl font-bold text-white">{startWeight.toFixed(1)}</p>
            <p className="text-xs text-white/60 font-medium">Start Weight</p>
          </div>
          <div className="text-center p-3 bg-teal-500/10 rounded-lg border-2 border-teal-400/30">
            <p className="text-2xl font-bold text-teal-400">{currentWeight.toFixed(1)}</p>
            <p className="text-xs text-white/60 font-medium">Current Weight</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${isGoalReached ? 'bg-emerald-500/10 border-2 border-emerald-400/30' : 'bg-white/5 border border-white/10'}`}>
            <p className={`text-2xl font-bold ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>
              {goalWeight.toFixed(1)}
            </p>
            <p className="text-xs text-white/60 font-medium">Goal Weight</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GoalProgress;