import React from 'react';
import { Card } from '../../ui/card';
import Icon from '@mdi/react';
import { mdiFire, mdiCheckCircle } from '@mdi/js';

interface FastingStatsProps {
  streakDays: number;
  completedFasts: number;
}

const FastingStats: React.FC<FastingStatsProps> = ({
  streakDays,
  completedFasts
}) => {
  // Handle NaN/undefined values
  const safeStreakDays = isNaN(streakDays) || streakDays === null || streakDays === undefined ? 0 : streakDays;
  const safeCompletedFasts = isNaN(completedFasts) || completedFasts === null || completedFasts === undefined ? 0 : completedFasts;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiFire} size={1.5} className="text-orange-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{safeStreakDays}</p>
        <p className="text-xs text-white/60">Day Streak</p>
      </Card>

      <Card className="p-4 text-center bg-white/5 border border-white/10">
        <Icon path={mdiCheckCircle} size={1.5} className="text-emerald-400 mx-auto mb-2" />
        <p className="text-2xl font-bold text-white">{safeCompletedFasts}</p>
        <p className="text-xs text-white/60">Completed Fasts</p>
      </Card>
    </div>
  );
};

export default FastingStats;