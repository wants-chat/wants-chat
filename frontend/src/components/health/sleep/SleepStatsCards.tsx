import React from 'react';
import { Moon, Clock, TrendingUp, Activity, Zap, Target } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { cn } from '../../../lib/utils';
import { formatSleepDuration } from '../../../types/health/sleep';
import type { SleepSummary, SleepGoalProgress } from '../../../types/health/sleep';

interface SleepStatsCardsProps {
  summary?: SleepSummary | null;
  progress?: SleepGoalProgress | null;
  isLoading?: boolean;
}

export const SleepStatsCards: React.FC<SleepStatsCardsProps> = ({
  summary,
  progress,
  isLoading,
}) => {
  const stats = [
    {
      label: 'Avg. Duration',
      value: summary?.averageSleepMinutes ? formatSleepDuration(summary.averageSleepMinutes) : '0h',
      icon: Clock,
      color: 'from-indigo-500 to-purple-500',
      change: progress?.durationProgress ? `${Math.round(progress.durationProgress)}% of goal` : undefined,
    },
    {
      label: 'Avg. Quality',
      value: summary?.averageQualityScore ? `${Math.round(summary.averageQualityScore)}` : '0',
      icon: Moon,
      color: 'from-violet-500 to-purple-500',
      change: progress?.qualityProgress ? `${Math.round(progress.qualityProgress)}% of goal` : undefined,
    },
    {
      label: 'Efficiency',
      value: summary?.averageEfficiency ? `${Math.round(summary.averageEfficiency)}%` : '0%',
      icon: Activity,
      color: 'from-cyan-500 to-teal-500',
      change: progress?.efficiencyProgress ? `${Math.round(progress.efficiencyProgress)}% of goal` : undefined,
    },
    {
      label: 'Streak',
      value: progress?.streakDays ? `${progress.streakDays} days` : '0 days',
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      change: `${progress?.daysLogged || 0}/${progress?.targetDays || 7} logged`,
    },
    {
      label: 'Best Duration',
      value: summary?.bestSleepDuration ? formatSleepDuration(summary.bestSleepDuration) : '0h',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
    },
    {
      label: 'Avg. Wake-ups',
      value: summary?.averageWakeUps ? summary.averageWakeUps.toFixed(1) : '0',
      icon: Target,
      color: 'from-rose-500 to-pink-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-12 bg-white/10 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-white/60 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                {stat.change && (
                  <p className="text-xs text-white/40 mt-1">{stat.change}</p>
                )}
              </div>
              <div
                className={cn(
                  'p-2 rounded-lg bg-gradient-to-br',
                  stat.color
                )}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SleepStatsCards;
