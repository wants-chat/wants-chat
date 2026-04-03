import React from 'react';
import { Card } from '../../ui/card';

interface CalorieHistory {
  date: Date;
  consumed: number;
  goal: number;
}

interface CalorieTrackingProps {
  calorieHistory: CalorieHistory[];
  daysOnTarget: number;
  avgConsumed: number;
}

const CalorieTracking: React.FC<CalorieTrackingProps> = ({
  calorieHistory,
  daysOnTarget,
  avgConsumed
}) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/5 border border-white/10">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Calorie Tracking</h3>

          {/* Calorie Chart */}
          <div className="h-48 flex items-end justify-between gap-1 bg-white/5 border border-white/10 rounded-lg p-4">
            {calorieHistory
              .filter((_, index) => index % Math.ceil(calorieHistory.length / 15) === 0)
              .map((entry, index) => {
                const height = (entry.consumed / 3000) * 100;
                const isOnTarget = entry.consumed >= entry.goal * 0.9 && entry.consumed <= entry.goal * 1.1;
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded-t transition-colors ${
                      isOnTarget ? 'bg-emerald-500/40 hover:bg-emerald-500/60' : 'bg-orange-500/40 hover:bg-orange-500/60'
                    }`}
                    style={{ height: `${Math.max(height, 10)}%` }}
                    title={`${entry.consumed} calories`}
                  />
                );
              })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
              <p className="text-2xl font-bold text-emerald-400">{daysOnTarget || 0}</p>
              <p className="text-sm text-white/60">Days on Target</p>
            </div>
            <div className="text-center p-4 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <p className="text-2xl font-bold text-cyan-400">{avgConsumed || 0}</p>
              <p className="text-sm text-white/60">Average Intake</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalorieTracking;