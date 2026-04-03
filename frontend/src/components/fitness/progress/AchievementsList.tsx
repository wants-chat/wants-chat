import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiTrophy,
  mdiGift,
  mdiCheckCircle,
  mdiTarget
} from '@mdi/js';
import { Card } from '../../ui/card';
import { cn } from '../../../lib/utils';
import { Achievement } from '../../../types/fitness';

interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  return (
    <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/10 rounded-lg">
          <Icon path={mdiTrophy} size={1} className="text-yellow-500" />
        </div>
        <h3 className="text-lg font-semibold">Achievements & Milestones</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "p-6 rounded-xl transition-all",
              achievement.unlockedAt
                ? "bg-gradient-to-br from-yellow-50/80 to-orange-50/80 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200/50 dark:border-yellow-800/30 shadow-lg"
                : "bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 opacity-70"
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-lg",
                achievement.unlockedAt
                  ? "bg-yellow-500/10"
                  : "bg-gray-200/50 dark:bg-gray-700/50"
              )}>
                <Icon 
                  path={achievement.unlockedAt ? mdiTrophy : mdiGift} 
                  size={1} 
                  className={cn(
                    achievement.unlockedAt ? "text-yellow-500" : "text-gray-400"
                  )}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{achievement.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                {achievement.unlockedAt ? (
                  <div className="flex items-center gap-2 mt-3">
                    <Icon path={mdiCheckCircle} size={0.6} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{achievement.progress ?? 0}/{achievement.target ?? 0}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${((achievement.progress ?? 0) / (achievement.target ?? 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Milestones Timeline */}
      <div className="mt-8">
        <h4 className="font-semibold mb-4">Recent Milestones</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <Icon path={mdiCheckCircle} size={0.8} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-medium">First 5kg Weight Loss</p>
              <p className="text-sm text-muted-foreground">Achieved on January 15, 2024</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <Icon path={mdiCheckCircle} size={0.8} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-medium">100kg Bench Press</p>
              <p className="text-sm text-muted-foreground">Achieved on January 28, 2024</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <div className="p-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full">
              <Icon path={mdiTarget} size={0.8} className="text-gray-400" />
            </div>
            <div>
              <p className="font-medium">6-Pack Definition</p>
              <p className="text-sm text-muted-foreground">In progress - Est. March 2024</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AchievementsList;