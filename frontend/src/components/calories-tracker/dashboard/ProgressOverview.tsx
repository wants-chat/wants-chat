import React from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiTrendingUp,
  mdiFire,
  mdiCalendarRange,
  mdiCheckCircle,
  mdiArrowRight,
  mdiTarget
} from '@mdi/js';

interface ProgressData {
  date: Date;
  calories: number;
  weight?: number;
}

interface ProgressOverviewProps {
  streak: number;
  weeklyProgress: ProgressData[];
  onViewProgress: () => void;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  streak,
  weeklyProgress,
  onViewProgress
}) => {
  const calculateWeeklyStats = () => {
    const totalCalories = weeklyProgress.reduce((sum, day) => sum + day.calories, 0);
    const avgCalories = Math.round(totalCalories / 7);
    const daysTracked = weeklyProgress.filter(day => day.calories > 0).length;
    
    // Calculate consistency (days tracked out of 7)
    const consistency = Math.round((daysTracked / 7) * 100);
    
    return {
      avgCalories,
      daysTracked,
      consistency,
      totalCalories
    };
  };

  const getStreakLevel = (days: number) => {
    if (days >= 30) return { level: 'Champion', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200' };
    if (days >= 21) return { level: 'Expert', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (days >= 14) return { level: 'Advanced', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (days >= 7) return { level: 'Intermediate', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    if (days >= 3) return { level: 'Beginner', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
    return { level: 'Getting Started', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
  };

  const getMotivationalMessage = (streak: number) => {
    if (streak === 0) return "Ready to start your journey?";
    if (streak === 1) return "Great start! Day one complete.";
    if (streak < 7) return "Building momentum, keep it up!";
    if (streak < 14) return "One week strong! You're forming habits.";
    if (streak < 30) return "Amazing consistency! You're on fire.";
    return "You're a tracking superstar! Incredible dedication.";
  };

  const stats = calculateWeeklyStats();
  const streakInfo = getStreakLevel(streak);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon path={mdiTrendingUp} size={1.2} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Progress Overview</h3>
              <p className="text-sm text-muted-foreground">Your weekly summary</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewProgress}
            className="gap-2"
          >
            View All
            <Icon path={mdiArrowRight} size={0.6} />
          </Button>
        </div>

        {/* Streak Section */}
        <div className={`p-4 rounded-lg border ${streakInfo.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <Icon path={mdiTarget} size={1} className={streakInfo.color} />
            <div>
              <p className={`font-semibold ${streakInfo.color}`}>
                {streak} Day Streak
              </p>
              <p className="text-sm text-muted-foreground">
                {streakInfo.level} Level
              </p>
            </div>
          </div>
          
          <p className="text-sm text-foreground mb-3">
            {getMotivationalMessage(streak)}
          </p>
          
          {/* Streak Progress to Next Level */}
          {streak < 30 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress to next level</span>
                <span>
                  {streak >= 21 ? `${30 - streak} days to Champion` :
                   streak >= 14 ? `${21 - streak} days to Expert` :
                   streak >= 7 ? `${14 - streak} days to Advanced` :
                   streak >= 3 ? `${7 - streak} days to Intermediate` :
                   `${3 - streak} days to Beginner`}
                </span>
              </div>
              
              <div className="h-2 bg-white rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${
                    streak >= 21 ? 'bg-purple-500' :
                    streak >= 14 ? 'bg-blue-500' :
                    streak >= 7 ? 'bg-emerald-500' :
                    streak >= 3 ? 'bg-orange-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ 
                    width: `${
                      streak >= 21 ? ((streak - 21) / 9) * 100 :
                      streak >= 14 ? ((streak - 14) / 7) * 100 :
                      streak >= 7 ? ((streak - 7) / 7) * 100 :
                      streak >= 3 ? ((streak - 3) / 4) * 100 :
                      (streak / 3) * 100
                    }%` 
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Weekly Stats */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">This Week</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <Icon path={mdiFire} size={1} className="text-orange-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.avgCalories}</p>
              <p className="text-xs text-muted-foreground">Avg Daily Calories</p>
            </div>
            
            <div className="text-center p-3 bg-secondary/20 rounded-lg">
              <Icon path={mdiCalendarRange} size={1} className="text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stats.daysTracked}/7</p>
              <p className="text-xs text-muted-foreground">Days Tracked</p>
            </div>
          </div>

          {/* Consistency Badge */}
          <div className="flex items-center justify-center">
            <Badge 
              variant={stats.consistency >= 85 ? "default" : "secondary"}
              className={`gap-1 ${
                stats.consistency >= 85 ? 'bg-emerald-100 text-emerald-800' : 
                stats.consistency >= 70 ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              <Icon 
                path={mdiCheckCircle} 
                size={0.5} 
              />
              {stats.consistency}% Consistency
            </Badge>
          </div>
        </div>

        {/* Weekly Tracking Visual */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">7-Day Tracking</h4>
          
          <div className="flex justify-between gap-1">
            {weeklyProgress.map((day, index) => {
              const isTracked = day.calories > 0;
              const isToday = day.date.toDateString() === new Date().toDateString();
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isTracked ? 'bg-emerald-500 text-white' : 
                      isToday ? 'bg-primary text-primary-foreground' :
                      'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {isTracked ? (
                      <Icon path={mdiCheckCircle} size={0.6} />
                    ) : (
                      day.date.getDate()
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Complete tracking to maintain your streak
            </p>
          </div>
        </div>

        {/* Achievement Preview */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3">
            <Icon path={mdiTarget} size={1} className="text-primary" />
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {streak >= 7 ? 'Week Warrior Achieved!' : 
                 streak >= 3 ? 'Streak Builder Achieved!' : 
                 'Next: Streak Builder (3 days)'}
              </p>
              <p className="text-xs text-muted-foreground">
                {streak >= 7 ? 'You tracked for a full week!' : 
                 streak >= 3 ? 'Three days of consistent tracking!' : 
                 `${3 - streak} more days to unlock`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProgressOverview;