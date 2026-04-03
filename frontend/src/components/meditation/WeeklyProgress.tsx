import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from 'lucide-react';

interface DayData {
  day: string;
  date: Date;
  minutes: number;
  sessions: number;
  completed: boolean;
}

interface WeeklyProgressProps {
  thisWeekMinutes: number;
  weeklyGoal: number;
  weeklyData: DayData[];
}

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  thisWeekMinutes,
  weeklyGoal,
  weeklyData,
}) => {
  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Calendar className="h-5 w-5 text-teal-400" />
          This Week's Progress
        </h3>
        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
          {thisWeekMinutes} minutes
        </Badge>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Weekly Goal</span>
          <span className="text-sm font-medium text-white">{thisWeekMinutes} / {weeklyGoal} min</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((thisWeekMinutes / weeklyGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {weeklyData.map((day, index) => (
          <div key={`${day.day}-${index}`} className="text-center">
            <div className="text-[10px] sm:text-xs text-white/60 mb-1">{day.day}</div>
            <Card className={`h-12 sm:h-16 flex flex-col items-center justify-center transition-colors cursor-pointer ${
              day.completed
                ? 'bg-teal-500/20 border-teal-500/30 hover:bg-teal-500/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
              title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.minutes} minutes${day.sessions > 0 ? `, ${day.sessions} session${day.sessions > 1 ? 's' : ''}` : ''}`}
            >
              {day.completed ? (
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-medium text-white">{day.minutes}</div>
                  <div className="text-[10px] sm:text-xs text-white/60">min</div>
                </div>
              ) : (
                <div className="w-2 h-2 rounded-full bg-white/30"></div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </Card>
  );
};