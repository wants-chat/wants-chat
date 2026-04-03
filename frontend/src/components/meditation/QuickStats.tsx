import React from 'react';
import { Card } from '../ui/card';
import { Activity, Clock, Flame, Trophy } from 'lucide-react';

interface QuickStatsProps {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

export const QuickStats: React.FC<QuickStatsProps> = ({
  totalSessions,
  totalMinutes,
  currentStreak,
  longestStreak,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card className="p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-white/60">Total Sessions</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalSessions}</p>
          </div>
          <div className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-white/60">Total Minutes</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalMinutes}</p>
          </div>
          <div className="p-2 bg-purple-500/20 border border-purple-500/30 rounded-lg">
            <Clock className="h-5 w-5 text-purple-400" />
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-white/60">Current Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{currentStreak} days</p>
          </div>
          <div className="p-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <Flame className="h-5 w-5 text-orange-400" />
          </div>
        </div>
      </Card>

      <Card className="p-3 sm:p-4 bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-white/60">Longest Streak</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{longestStreak} days</p>
          </div>
          <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
            <Trophy className="h-5 w-5 text-emerald-400" />
          </div>
        </div>
      </Card>
    </div>
  );
};