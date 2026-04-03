import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiScale, mdiTarget, mdiFire, mdiCheckCircle } from '@mdi/js';

interface WeightStatsProps {
  totalLost: number;
  toGoal: number;
  avgCalories: number;
  accuracy: number;
}

const WeightStats: React.FC<WeightStatsProps> = ({
  totalLost,
  toGoal,
  avgCalories,
  accuracy
}) => {
  // Helper function to safely format numbers
  const safeToFixed = (value: number, decimals: number = 1): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return value.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiScale} size={1.2} className="text-teal-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">
          {safeToFixed(totalLost)}kg
        </p>
        <p className="text-xs text-white/60">Total Lost</p>
      </Card>

      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiTarget} size={1.2} className="text-blue-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">
          {safeToFixed(toGoal)}kg
        </p>
        <p className="text-xs text-white/60">To Goal</p>
      </Card>

      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiFire} size={1.2} className="text-orange-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">
          {avgCalories || 0}
        </p>
        <p className="text-xs text-white/60">Avg Calories</p>
      </Card>

      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiCheckCircle} size={1.2} className="text-emerald-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">
          {accuracy || 0}%
        </p>
        <p className="text-xs text-white/60">On Target</p>
      </Card>
    </div>
  );
};

export default WeightStats;