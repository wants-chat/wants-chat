import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy } from 'lucide-react';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  date?: string;
}

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Achievements
        </h3>
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          {unlockedCount} / {totalCount}
        </Badge>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30 text-yellow-400" />
          <p className="text-sm">Start meditating to unlock achievements!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2 sm:gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 sm:p-4 rounded-lg text-center ${
                achievement.unlocked
                  ? 'bg-yellow-500/10 border border-yellow-500/20'
                  : 'bg-white/5 border border-white/10 opacity-50'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{achievement.icon}</div>
              <div className="text-xs sm:text-sm font-medium text-white">{achievement.title}</div>
              {achievement.unlocked && achievement.date && (
                <div className="text-[10px] sm:text-xs text-white/60 mt-1">{achievement.date}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};