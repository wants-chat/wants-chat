import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Button } from '../../ui/button';
import { Target, TrendingUp, Calendar, Clock, Flame, Award } from 'lucide-react';

interface WorkoutGoal {
  id: string;
  type: 'weekly' | 'monthly' | 'custom';
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline?: Date;
  reward?: string;
}

interface WorkoutStat {
  label: string;
  value: string | number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface WorkoutProgressProps {
  goals?: WorkoutGoal[];
  stats?: WorkoutStat[];
  onUpdateGoal?: (goalId: string) => void;
}

const defaultGoals: WorkoutGoal[] = [
  {
    id: '1',
    type: 'weekly',
    name: 'Weekly Workouts',
    current: 3,
    target: 5,
    unit: 'sessions',
    reward: '50 bonus points'
  },
  {
    id: '2',
    type: 'monthly',
    name: 'Monthly Calories',
    current: 8500,
    target: 12000,
    unit: 'cal',
    reward: 'New badge'
  },
  {
    id: '3',
    type: 'custom',
    name: '30-Day Challenge',
    current: 12,
    target: 30,
    unit: 'days',
    deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    reward: 'Premium workout plan'
  }
];

const defaultStats: WorkoutStat[] = [
  { label: 'This Week', value: '3h 45m', change: 15, icon: Clock },
  { label: 'Calories', value: '2,450', change: 8, icon: Flame },
  { label: 'Streak', value: '5 days', change: 25, icon: Calendar },
  { label: 'PRs Set', value: 4, change: 100, icon: Award }
];

const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  goals = defaultGoals,
  stats = defaultStats,
  onUpdateGoal
}) => {
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysUntilDeadline = (deadline?: Date) => {
    if (!deadline) return null;
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getGoalStatus = (goal: WorkoutGoal) => {
    const progress = calculateProgress(goal.current, goal.target);
    if (progress >= 100) return 'completed';
    if (goal.deadline) {
      const daysLeft = getDaysUntilDeadline(goal.deadline);
      if (daysLeft && daysLeft < 3) return 'urgent';
    }
    if (progress >= 70) return 'on-track';
    return 'behind';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-400 bg-emerald-500/20';
      case 'on-track': return 'text-teal-400 bg-teal-500/20';
      case 'urgent': return 'text-red-400 bg-red-500/20';
      case 'behind': return 'text-white/60 bg-white/10';
      default: return 'text-white/60 bg-white/10';
    }
  };

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Workout Progress</h3>
        <p className="text-sm text-white/60">Track your fitness goals and achievements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="h-4 w-4 text-teal-400" />
                <span className="text-xs text-white/60">{stat.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">{stat.value}</span>
                {stat.change !== 0 && (
                  <span className={`text-xs font-medium ${
                    stat.change > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Goals Progress */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Active Goals</h4>
          <Button size="sm" className="h-7 text-xs bg-teal-500/10 border border-teal-400/30 text-teal-400 hover:bg-teal-500/20 hover:scale-105 transition-all duration-200">
            <Target className="h-3 w-3 mr-1" />
            Set New Goal
          </Button>
        </div>

        {goals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target);
          const status = getGoalStatus(goal);
          const daysLeft = getDaysUntilDeadline(goal.deadline);

          return (
            <div key={goal.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{goal.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-white/60">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                    {daysLeft !== null && (
                      <Badge className="text-xs bg-white/10 border border-white/20 text-white/80">
                        {daysLeft} days left
                      </Badge>
                    )}
                    {goal.reward && (
                      <Badge className={`text-xs ${getStatusColor(status)}`}>
                        🎁 {goal.reward}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onUpdateGoal?.(goal.id)}
                  className="h-7 px-2 text-xs bg-white/10 border border-white/20 text-white hover:scale-105 transition-all duration-200"
                  disabled={status === 'completed'}
                >
                  {status === 'completed' ? '✓ Done' : 'Update'}
                </Button>
              </div>

              <div className="space-y-1">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/60">{progress.toFixed(0)}% complete</span>
                  <span className={`font-medium ${
                    status === 'completed' ? 'text-emerald-400' :
                    status === 'on-track' ? 'text-teal-400' :
                    status === 'urgent' ? 'text-red-400' :
                    'text-white/60'
                  }`}>
                    {status === 'completed' ? 'Completed!' :
                     status === 'on-track' ? 'On track' :
                     status === 'urgent' ? 'Almost due!' :
                     'Keep pushing'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Footer */}
      <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Great Progress!</p>
            <p className="text-xs text-white/60">
              You're 60% closer to your monthly fitness goals. Keep it up!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WorkoutProgress;