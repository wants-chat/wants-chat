import React from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import Icon from '@mdi/react';
import { 
  mdiTrophy, 
  mdiFire, 
  mdiScale, 
  mdiCalendar, 
  mdiFood,
  mdiWater,
  mdiRun,
  mdiCheckCircle
} from '@mdi/js';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number;
  target?: number;
}

interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      trophy: mdiTrophy,
      fire: mdiFire,
      scale: mdiScale,
      calendar: mdiCalendar,
      food: mdiFood,
      water: mdiWater,
      run: mdiRun,
      check: mdiCheckCircle
    };
    return icons[iconName] || mdiTrophy;
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="space-y-6">
      {unlockedAchievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Unlocked Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Icon path={getIcon(achievement.icon)} size={1} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.unlockedDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Unlocked {achievement.unlockedDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {lockedAchievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Locked Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-start gap-3 p-4 bg-secondary/20 rounded-lg opacity-60">
                <div className="p-2 bg-secondary/30 rounded-full">
                  <Icon path={getIcon(achievement.icon)} size={1} className="text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.progress !== undefined && achievement.target !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}/{achievement.target}</span>
                      </div>
                      <div className="w-full h-2 bg-secondary/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary/50 transition-all"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AchievementsList;