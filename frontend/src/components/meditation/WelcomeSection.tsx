import React from 'react';
import { Skeleton } from '../ui/skeleton';

interface WelcomeSectionProps {
  greeting: string;
  currentStreak: number;
  totalSessions: number;
  statsLoading: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  greeting,
  currentStreak,
  totalSessions,
  statsLoading
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">
            {greeting}, welcome to your mindfulness journey
          </h1>
          <p className="text-sm text-white/60">
            Find your inner peace with guided meditation
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold text-white">{currentStreak}</div>
            )}
            <div className="text-xs text-white/40">Day Streak</div>
          </div>
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
            ) : (
              <div className="text-2xl font-bold text-white">{totalSessions}</div>
            )}
            <div className="text-xs text-white/40">Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );
};