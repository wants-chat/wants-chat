import React from 'react';
import { TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Habit } from '../../hooks/habits/useHabits';

interface HabitStatsProps {
  habits: Habit[];
  completedToday: number;
  totalActive: number;
  averageStreak: number;
}

export const HabitStats: React.FC<HabitStatsProps> = ({
  habits,
  completedToday,
  totalActive,
  averageStreak
}) => {
  const stats = [
    {
      title: 'Active Habits',
      value: totalActive,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      title: 'Completed Today',
      value: `${completedToday}/${totalActive}`,
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900'
    },
    {
      title: 'Average Streak',
      value: `${averageStreak} days`,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900'
    },
    {
      title: 'Best Streak',
      value: `${Math.max(...habits.map(h => h.best_streak || 0), 0)} days`,
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stat.value}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};