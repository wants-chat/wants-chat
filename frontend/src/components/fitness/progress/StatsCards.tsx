import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiWeight,
  mdiScaleBalance,
  mdiDumbbell,
  mdiFire,
  mdiTrophy,
  mdiTrendingUp,
  mdiTrendingDown
} from '@mdi/js';
import { Card } from '../../ui/card';
import { cn } from '../../../lib/utils';

interface StatsData {
  currentWeight: number;
  weightChange: number;
  bmi: string | number;
  totalWorkouts: number;
  currentStreak: number;
  achievements: number;
}

interface StatsCardsProps {
  stats: StatsData | null;
  loading?: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  if (!stats && !loading) return null;

  const statCards = [
    {
      title: 'Current Weight',
      value: `${stats?.currentWeight?.toFixed(1) ?? '0.0'} kg`,
      icon: mdiWeight,
      iconBg: 'bg-teal-500/20',
      iconColor: 'text-teal-400'
    },
    {
      title: 'BMI Index',
      value: stats?.bmi?.toString() ?? '0',
      icon: mdiScaleBalance,
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
      badge: 'Normal'
    },
    {
      title: 'Total Workouts',
      value: stats?.totalWorkouts?.toString() ?? '0',
      icon: mdiDumbbell,
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400'
    },
    {
      title: 'Day Streak',
      value: stats?.currentStreak?.toString() ?? '0',
      icon: mdiFire,
      iconBg: 'bg-orange-500/20',
      iconColor: 'text-orange-400'
    },
    {
      title: 'Achievements',
      value: stats?.achievements?.toString() ?? '0',
      icon: mdiTrophy,
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {statCards.map((card, index) => (
        <Card key={index} className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-lg", card.iconBg)}>
                <Icon
                  path={card.icon}
                  size={1}
                  className={card.iconColor}
                />
              </div>

              {card.badge && (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  {card.badge}
                </span>
              )}
            </div>

            <div>
              {loading ? (
                <div className="h-8 bg-white/20 rounded w-16 mb-2 animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-white">{card.value}</p>
              )}
              <p className="text-sm text-white/60">{card.title}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;