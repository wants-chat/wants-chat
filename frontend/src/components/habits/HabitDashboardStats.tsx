import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';

interface HabitDashboardStatsProps {
  userStats?: {
    total_habits: number;
    active_habits: number;
    total_completions: number;
    today_completions: number;
    habits_by_category: Record<string, number>;
    best_streaks: Array<{ habit_id: string; habit_name: string; streak: number }>;
  };
  loading: boolean;
}

export const HabitDashboardStats: React.FC<HabitDashboardStatsProps> = ({ userStats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-white/10 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-white/10 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Habits',
      value: userStats?.total_habits || 0,
      icon: Target,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Active Habits',
      value: userStats?.active_habits || 0,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: "Today's Completions",
      value: userStats?.today_completions || 0,
      icon: Calendar,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Total Completions',
      value: userStats?.total_completions || 0,
      icon: Award,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white/60">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stat.value.toLocaleString()}
              </div>
              {stat.title === 'Active Habits' && userStats?.total_habits ? (
                <p className="text-xs text-white/60 mt-1">
                  {Math.round((stat.value / userStats.total_habits) * 100)}% of total
                </p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HabitDashboardStats;