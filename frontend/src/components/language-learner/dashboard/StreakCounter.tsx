import React from 'react';
import { Flame, Calendar, Trophy, Target } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  goalDays: number;
  lastActiveDate?: Date;
  showMotivation?: boolean;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  goalDays = 7,
  lastActiveDate,
  showMotivation = true
}) => {
  const isOnFire = currentStreak >= 3;
  const isCloseToRecord = longestStreak > 0 && currentStreak >= longestStreak - 2;
  const progressToGoal = Math.min((currentStreak / goalDays) * 100, 100);

  const getMotivationalMessage = () => {
    if (currentStreak === 0) {
      return "Start your streak today! 💪";
    }
    if (currentStreak === 1) {
      return "Great start! Keep it going! 🌟";
    }
    if (currentStreak < 7) {
      return `${7 - currentStreak} more days for a week streak! 🎯`;
    }
    if (currentStreak === longestStreak && currentStreak > 7) {
      return "New personal record! Amazing! 🏆";
    }
    if (isCloseToRecord) {
      return `So close to your record of ${longestStreak}! 🔥`;
    }
    if (currentStreak >= 30) {
      return "You're a language learning legend! 👑";
    }
    if (currentStreak >= 14) {
      return "Two weeks strong! Incredible! ⚡";
    }
    return "You're on fire! Keep going! 🚀";
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return 'text-muted-foreground';
    if (currentStreak < 3) return 'text-primary';
    if (currentStreak < 7) return 'text-primary';
    if (currentStreak < 14) return 'text-primary';
    if (currentStreak < 30) return 'text-primary';
    return 'text-primary';
  };

  const getStreakIntensity = () => {
    if (currentStreak < 3) return '';
    if (currentStreak < 7) return 'animate-pulse';
    if (currentStreak < 14) return 'animate-bounce';
    return 'animate-pulse';
  };

  return (
    <Card className={`
      transition-all duration-300 hover:shadow-lg
      ${isOnFire ? 'bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20' : ''}
    `}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Main Streak Display */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Flame className={`h-8 w-8 ${getStreakColor()} ${getStreakIntensity()}`} />
              <div className="text-4xl font-bold text-foreground">
                {currentStreak}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mb-1">
              Day{currentStreak !== 1 ? 's' : ''} Streak
            </div>
            {showMotivation && (
              <div className="text-sm font-medium text-primary">
                {getMotivationalMessage()}
              </div>
            )}
          </div>

          {/* Progress to Goal */}
          {goalDays > currentStreak && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Goal Progress</span>
                </div>
                <span className="font-medium text-foreground">
                  {currentStreak}/{goalDays} days
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressToGoal}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-center">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Best</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {longestStreak}
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">This Week</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {Math.min(currentStreak, 7)}
              </div>
            </div>

            {currentStreak >= goalDays && (
              <div className="text-center">
                <Badge 
                  variant="secondary" 
                  className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                >
                  Goal Reached! 🎉
                </Badge>
              </div>
            )}
          </div>

          {/* Streak Milestones */}
          {currentStreak > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {[3, 7, 14, 30, 100].map((milestone) => (
                <Badge
                  key={milestone}
                  variant={currentStreak >= milestone ? "default" : "outline"}
                  className={`text-xs ${
                    currentStreak >= milestone
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'text-muted-foreground'
                  }`}
                >
                  {milestone}d
                </Badge>
              ))}
            </div>
          )}

          {/* Freeze Available */}
          {currentStreak > 7 && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs text-primary border-primary/20">
                💎 Streak Freeze Available
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCounter;