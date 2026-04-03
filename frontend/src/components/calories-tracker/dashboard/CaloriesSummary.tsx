import React from 'react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import { Flame, TrendingUp, AlertCircle } from 'lucide-react';

interface CaloriesSummaryProps {
  consumed: number;
  burned: number;
  goal: number;
  remaining: number;
}

const CaloriesSummary: React.FC<CaloriesSummaryProps> = ({
  consumed,
  burned,
  goal,
  remaining
}) => {
  const netCalories = consumed - burned;
  const progress = (netCalories / goal) * 100;
  const isOverGoal = netCalories > goal;

  const getStatusColor = () => {
    if (progress < 80) return 'text-orange-400';
    if (progress > 110) return 'text-red-400';
    return 'text-emerald-400';
  };

  const getStatusMessage = () => {
    if (progress < 50) return 'You need more calories today';
    if (progress < 80) return 'You\'re making good progress';
    if (progress <= 110) return 'Perfect! You\'re on track';
    return 'You\'ve exceeded your daily goal';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 rounded-xl">
              <Flame className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Daily Calories</h3>
              <p className="text-sm text-white/60">
                Net calories today
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-3xl font-bold text-white">{netCalories}</p>
            <p className="text-sm text-white/60">/ {goal} cal</p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
          <div>
            <p className="text-sm text-white/60">Consumed</p>
            <p className="text-xl font-bold text-white">{consumed}</p>
          </div>
          <div>
            <p className="text-sm text-white/60">Burned</p>
            <p className="text-xl font-bold text-emerald-400">-{burned}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Progress</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {Math.round(progress)}%
            </span>
          </div>

          <Progress
            value={Math.min(progress, 100)}
            className="h-3"
          />

          {isOverGoal && (
            <div className="h-3 bg-red-500/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((progress - 100), 50)}%` }}
              />
            </div>
          )}
        </div>

        {/* Status Message */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${getStatusColor()}`}>
            {isOverGoal ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <TrendingUp className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">
              {getStatusMessage()}
            </span>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${isOverGoal ? 'text-red-400' : 'text-emerald-400'}`}>
              {isOverGoal ? `+${Math.abs(remaining)}` : remaining}
            </p>
            <p className="text-xs text-white/60">
              {isOverGoal ? 'over goal' : 'remaining'}
            </p>
          </div>
        </div>

        {/* Meal Distribution */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-lg font-bold text-white">{Math.round(goal * 0.25)}</p>
            <p className="text-xs text-white/60">Breakfast</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-lg font-bold text-white">{Math.round(goal * 0.30)}</p>
            <p className="text-xs text-white/60">Lunch</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-lg font-bold text-white">{Math.round(goal * 0.35)}</p>
            <p className="text-xs text-white/60">Dinner</p>
          </div>
          <div className="text-center p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg">
            <p className="text-lg font-bold text-white">{Math.round(goal * 0.10)}</p>
            <p className="text-xs text-white/60">Snacks</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CaloriesSummary;