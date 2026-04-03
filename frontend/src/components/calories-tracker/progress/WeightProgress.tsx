import React from 'react';
import { Card } from '../../ui/card';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { mdiTrendingDown, mdiTrendingUp } from '@mdi/js';

interface WeightEntry {
  date: Date;
  weight: number;
}

interface WeightProgressProps {
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
  totalLost: number;
  progress: number;
  weightHistory: WeightEntry[];
}

const WeightProgress: React.FC<WeightProgressProps> = ({
  startWeight,
  currentWeight,
  goalWeight,
  totalLost,
  progress,
  weightHistory
}) => {
  // Helper function to safely format numbers
  const safeToFixed = (value: number, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '0';
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Weight Progress</h3>
            <div className="flex items-center gap-2">
              <Icon
                path={totalLost > 0 ? mdiTrendingDown : mdiTrendingUp}
                size={0.8}
                className={totalLost > 0 ? 'text-emerald-400' : 'text-red-400'}
              />
              <span className={`text-sm font-medium ${
                totalLost > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {totalLost > 0 ? '-' : '+'}{safeToFixed(Math.abs(totalLost || 0))}kg
              </span>
            </div>
          </div>

          {/* Simple Chart Visualization */}
          <div className="h-48 bg-white/5 border border-white/10 rounded-lg p-4">
            {weightHistory.length > 0 ? (
              <div className="h-full flex items-end justify-between gap-1">
                {weightHistory
                  .slice(-20) // Show last 20 entries max
                  .map((entry, index) => {
                    // Calculate min and max for proper scaling
                    const weights = weightHistory.map(e => e.weight);
                    const minWeight = Math.min(...weights) - 5;
                    const maxWeight = Math.max(...weights) + 5;
                    const range = maxWeight - minWeight;
                    const height = ((entry.weight - minWeight) / range) * 100;

                    return (
                      <div
                        key={index}
                        className="flex-1 bg-teal-500/30 hover:bg-teal-500/50 transition-all hover:scale-105 rounded-t cursor-pointer relative group"
                        style={{ height: `${Math.max(height, 5)}%`, minWidth: '10px' }}
                        title={`${entry.weight}kg on ${entry.date.toLocaleDateString()}`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-800/90 border border-white/20 px-2 py-1 rounded text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                          {entry.weight}kg
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/60">
                No weight data available
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-white/60">Start</p>
              <p className="text-lg font-bold text-white">{safeToFixed(startWeight || 0)}kg</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Current</p>
              <p className="text-lg font-bold text-teal-400">{safeToFixed(currentWeight || 0)}kg</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Goal</p>
              <p className="text-lg font-bold text-white">{safeToFixed(goalWeight || 0)}kg</p>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Progress to Goal</span>
              <span className="font-medium text-white">
                {safeToFixed(progress || 0, 0)}%
              </span>
            </div>
            <Progress value={progress || 0} className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-teal-500 [&>div]:to-cyan-500" />
          </div>
        </div>
      </Card>

      {/* Recent Entries */}
      <Card className="p-6 bg-white/5 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Entries</h3>
        <div className="space-y-2">
          {weightHistory.filter(entry => entry && entry.date && typeof entry.weight === 'number').slice(-7).reverse().map((entry, index) => {
            const reversedHistory = weightHistory.slice(-7).reverse();
            const previousEntry = index > 0 ? reversedHistory[index - 1] : null;

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="font-medium text-white">
                    {entry.date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {previousEntry && previousEntry.weight && (
                    <p className={`text-xs ${
                      entry.weight < previousEntry.weight
                        ? 'text-emerald-400' : 'text-orange-400'
                    }`}>
                      {entry.weight < previousEntry.weight ? '↓' : '↑'}
                      {safeToFixed(Math.abs(entry.weight - previousEntry.weight))}kg
                    </p>
                  )}
                </div>
                <p className="text-lg font-bold text-white">{safeToFixed(entry.weight || 0)}kg</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default WeightProgress;