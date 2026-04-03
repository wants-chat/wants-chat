import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import Icon from '@mdi/react';
import { mdiFire, mdiBarley, mdiDumbbell, mdiOilTemperature } from '@mdi/js';

interface DailySummaryProps {
  dailyTotals: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
  dailyGoals: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
  };
}

const DailySummary: React.FC<DailySummaryProps> = ({ dailyTotals, dailyGoals }) => {
  const caloriesProgress = (dailyTotals.calories / dailyGoals.calories) * 100;

  return (
    <Card className="p-6 bg-white/5 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Daily Summary</h3>
          <Badge
            className={
              caloriesProgress >= 90 && caloriesProgress <= 110
                ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                : "bg-white/10 text-white/70 border border-white/20"
            }
          >
            {Math.round(caloriesProgress)}% of goal
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <Icon path={mdiFire} size={1.5} className="text-orange-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-white">{dailyTotals.calories}</p>
            <p className="text-xs text-white/60">of {dailyGoals.calories} cal</p>
            <Progress
              value={Math.min((dailyTotals.calories / dailyGoals.calories) * 100, 100)}
              className="h-1 mt-2 bg-white/10 [&>div]:bg-orange-400"
            />
          </div>

          <div className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
            <Icon path={mdiBarley} size={1.5} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-emerald-400">{dailyTotals.carbs}g</p>
            <p className="text-xs text-white/60">of {dailyGoals.carbs}g carbs</p>
            <Progress
              value={Math.min((dailyTotals.carbs / dailyGoals.carbs) * 100, 100)}
              className="h-1 mt-2 bg-white/10 [&>div]:bg-emerald-400"
            />
          </div>

          <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <Icon path={mdiDumbbell} size={1.5} className="text-blue-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-blue-400">{dailyTotals.protein}g</p>
            <p className="text-xs text-white/60">of {dailyGoals.protein}g protein</p>
            <Progress
              value={Math.min((dailyTotals.protein / dailyGoals.protein) * 100, 100)}
              className="h-1 mt-2 bg-white/10 [&>div]:bg-blue-400"
            />
          </div>

          <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/30">
            <Icon path={mdiOilTemperature} size={1.5} className="text-orange-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-orange-400">{dailyTotals.fat}g</p>
            <p className="text-xs text-white/60">of {dailyGoals.fat}g fat</p>
            <Progress
              value={Math.min((dailyTotals.fat / dailyGoals.fat) * 100, 100)}
              className="h-1 mt-2 bg-white/10 [&>div]:bg-orange-400"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DailySummary;