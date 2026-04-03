import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  LocalFireDepartment as FireIcon,
  TrendingUp as TrendingIcon,
  Schedule as ClockIcon,
  EmojiEvents as TrophyIcon
} from '@mui/icons-material';
import { MeditationStreak } from '../../../types/meditation';

interface StreakCounterProps {
  streak: MeditationStreak;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  streak,
  showDetails = true,
  size = 'md'
}) => {
  const getStreakColor = (streakCount: number) => {
    if (streakCount >= 30) return 'from-orange-500 to-red-500';
    if (streakCount >= 14) return 'from-yellow-500 to-orange-500';
    if (streakCount >= 7) return 'from-green-500 to-emerald-500';
    if (streakCount >= 3) return 'from-blue-500 to-cyan-500';
    return 'from-gray-400 to-gray-500';
  };

  const getStreakMessage = (streakCount: number) => {
    if (streakCount >= 30) return "Meditation Master! 🧘‍♂️";
    if (streakCount >= 14) return "Two weeks strong! 🌟";
    if (streakCount >= 7) return "One week streak! 🔥";
    if (streakCount >= 3) return "Great start! 💪";
    if (streakCount >= 1) return "Keep it up! 🌱";
    return "Start your journey! ✨";
  };

  const getFireIntensity = (streakCount: number) => {
    if (streakCount >= 30) return 'animate-pulse';
    if (streakCount >= 14) return 'animate-bounce';
    if (streakCount >= 7) return '';
    return '';
  };

  const sizeClasses = {
    sm: { card: 'p-4', icon: 'h-8 w-8', text: 'text-lg', subtitle: 'text-xs' },
    md: { card: 'p-6', icon: 'h-12 w-12', text: 'text-2xl', subtitle: 'text-sm' },
    lg: { card: 'p-8', icon: 'h-16 w-16', text: 'text-4xl', subtitle: 'text-base' }
  };

  const classes = sizeClasses[size];

  return (
    <Card className={`bg-gradient-to-br ${getStreakColor(streak.current)} text-white border-0 shadow-lg relative overflow-hidden`}>
      <CardContent className={classes.card}>
        {/* Background decoration */}
        <div className="absolute top-0 right-0 opacity-10">
          <div className="w-24 h-24 rounded-full bg-white transform translate-x-8 -translate-y-8"></div>
        </div>
        <div className="absolute bottom-0 left-0 opacity-5">
          <div className="w-32 h-32 rounded-full bg-white transform -translate-x-16 translate-y-16"></div>
        </div>

        <div className="relative z-10">
          {/* Main streak display */}
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <FireIcon className={`${classes.icon} ${getFireIntensity(streak.current)} drop-shadow-lg`} />
            </div>
            <div className={`${classes.text} font-bold mb-1`}>
              {streak.current}
            </div>
            <div className={`${classes.subtitle} opacity-90`}>
              Day Streak
            </div>
            <div className="text-xs opacity-75 mt-1">
              {getStreakMessage(streak.current)}
            </div>
          </div>

          {showDetails && (
            <>
              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrophyIcon className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="font-semibold">{streak.longest}</div>
                  <div className="text-xs opacity-75">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <ClockIcon className="h-5 w-5 opacity-80" />
                  </div>
                  <div className="font-semibold">{Math.floor(streak.totalMinutes / 60)}h {streak.totalMinutes % 60}m</div>
                  <div className="text-xs opacity-75">Total Time</div>
                </div>
              </div>

              {/* Milestones */}
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-xs opacity-75">
                  <span>Next milestone:</span>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {streak.current < 7 ? '7 days' :
                     streak.current < 14 ? '14 days' :
                     streak.current < 30 ? '30 days' :
                     streak.current < 100 ? '100 days' : '365 days'}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, 
                        streak.current < 7 ? (streak.current / 7) * 100 :
                        streak.current < 14 ? ((streak.current - 7) / 7) * 100 :
                        streak.current < 30 ? ((streak.current - 14) / 16) * 100 :
                        streak.current < 100 ? ((streak.current - 30) / 70) * 100 :
                        ((streak.current - 100) / 265) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>

              {/* Sessions count */}
              <div className="mt-4 text-center">
                <div className="text-sm opacity-90">
                  <span className="font-semibold">{streak.totalSessions}</span> total sessions completed
                </div>
                {streak.lastMeditationDate && (
                  <div className="text-xs opacity-75 mt-1">
                    Last meditation: {new Date(streak.lastMeditationDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sparkle effects for high streaks */}
        {streak.current >= 7 && (
          <>
            <div className="absolute top-4 right-4 animate-pulse">✨</div>
            <div className="absolute bottom-4 left-4 animate-pulse delay-1000">⭐</div>
          </>
        )}
        {streak.current >= 30 && (
          <>
            <div className="absolute top-1/2 left-4 animate-bounce delay-500">🌟</div>
            <div className="absolute top-1/4 right-8 animate-pulse delay-700">💫</div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;