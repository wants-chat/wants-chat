import React from 'react';
import { 
  Dumbbell, 
  Calendar, 
  Weight, 
  Clock,
  Flame,
  TrendingUp
} from 'lucide-react';
import { FitnessStats } from '../../../types/fitness';

interface StatsOverviewProps {
  stats: FitnessStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      icon: Dumbbell,
      label: 'Total Workouts',
      value: stats.totalWorkouts,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: Calendar,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Weight,
      label: 'Weight Lifted',
      value: `${(stats.totalWeight / 1000).toFixed(1)} tons`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
    {
      icon: Clock,
      label: 'Total Duration',
      value: `${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}m`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      icon: Flame,
      label: 'Longest Streak',
      value: `${stats.longestStreak} days`,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Total Exercises',
      value: stats.totalExercises,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 mb-1">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;