import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { TrendingUp } from 'lucide-react';
import Icon from '@mdi/react';

interface QuickSession {
  id: string;
  title: string;
  duration: number;
  icon: string;
  audioUrl?: string;
  description?: string;
  narrator?: string;
  category?: string;
  type?: string;
}

interface UserStats {
  todayProgress: number;
  todayGoal: number;
  currentStreak?: number;
  totalSessions?: number;
}

interface TodaysPracticeProps {
  userStats: UserStats;
  quickSessions: QuickSession[];
  weeklyStats: { sessions: number; minutes: number };
  avgDailyMinutes: number;
  goalsLoading: boolean;
  statsLoading: boolean;
}

export const TodaysPractice: React.FC<TodaysPracticeProps> = ({
  userStats,
  quickSessions,
  weeklyStats,
  avgDailyMinutes,
  goalsLoading,
  statsLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-5 lg:col-span-1">
      <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
        <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse"></div>
        Today's Practice
      </h2>

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Today's Goal</span>
            {goalsLoading ? (
              <Skeleton className="h-4 w-20" />
            ) : (
              <span className="text-sm font-medium text-white">
                {userStats.todayProgress} / {userStats.todayGoal} min
              </span>
            )}
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(((userStats.todayProgress / userStats.todayGoal) * 100) || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium text-white mb-2">Quick Sessions</h5>
          <div className="space-y-2">
            {quickSessions.length > 0 ? (
              quickSessions.map((session, index) => (
                <Button
                  key={session.id || index}
                  className="w-full justify-between h-10 px-3 bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    // If session has audioUrl (from API), navigate with UUID
                    // Otherwise use the original quick session pattern
                    if (session.audioUrl) {
                      navigate(`/meditation/player/${session.id}`);
                    } else {
                      navigate(`/meditation/player/quick/session/${session.duration}`);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon path={session.icon} size={0.7} className="text-teal-400" />
                    <span className="text-sm">{session.title}</span>
                  </div>
                  <span className="text-xs text-white/60">{session.duration} min</span>
                </Button>
              ))
            ) : (
              <div className="text-center py-4 text-sm text-white/60">
                No quick sessions available
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-lg border border-white/10">
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
            ) : (
              <p className="text-lg font-bold text-white">{userStats.todayProgress}</p>
            )}
            <p className="text-xs text-white/60">Today</p>
          </div>
          <div className="text-center border-x border-white/20">
            {statsLoading ? (
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
            ) : (
              <p className="text-lg font-bold text-white">{weeklyStats.minutes}</p>
            )}
            <p className="text-xs text-white/60">This Week</p>
          </div>
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
            ) : (
              <p className="text-lg font-bold text-white">{avgDailyMinutes}</p>
            )}
            <p className="text-xs text-white/60">Avg Min</p>
          </div>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-10"
          onClick={() => navigate('/meditation/profile')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Full Progress
        </Button>
      </div>
    </div>
  );
};