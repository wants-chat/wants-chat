import React, { useState } from 'react';
import Icon from '@mdi/react';
import { 
  mdiTrophy,
  mdiStar,
  mdiFire,
  mdiTarget,
  mdiDumbbell,
  mdiShare,
  mdiDownload,
  mdiLock,
  mdiCheckCircle
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Achievement } from '../../../types/fitness';

interface ExtendedAchievement extends Achievement {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  shareUrl?: string;
  certificateUrl?: string;
}

interface AchievementsBadgesProps {
  achievements: ExtendedAchievement[];
  totalPoints: number;
  nextMilestone?: { points: number; title: string };
  onShareAchievement?: (achievementId: string) => void;
  onDownloadCertificate?: (achievementId: string) => void;
}

const AchievementsBadges: React.FC<AchievementsBadgesProps> = ({
  achievements,
  totalPoints,
  nextMilestone,
  onShareAchievement,
  onDownloadCertificate
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'recent'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return mdiDumbbell;
      case 'streak': return mdiFire;
      case 'weight': return mdiTarget;
      case 'milestone': return mdiTrophy;
      default: return mdiStar;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-white/10 text-white/60 border-white/20';
      case 'rare':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'epic':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'shadow-lg shadow-emerald-500/20';
      case 'epic':
        return 'shadow-lg shadow-accent/20';
      case 'rare':
        return 'shadow-lg shadow-primary/20';
      default:
        return '';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    // Category filter
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }

    // Status filter
    switch (filter) {
      case 'unlocked': return achievement.unlockedAt;
      case 'locked': return !achievement.unlockedAt;
      case 'recent': 
        return achievement.unlockedAt && 
               achievement.unlockedAt.getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000); // Last 30 days
      default: return true;
    }
  });

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalAchievements = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalAchievements) * 100);

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <Card className="p-6 bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 rounded-lg">
            <Icon path={mdiTrophy} size={1} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Achievements & Badges</h3>
            <p className="text-sm text-white/60">
              {unlockedCount} of {totalAchievements} unlocked ({completionPercentage}%)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-[120px] bg-white/10 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unlocked">Unlocked</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Points and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Total Points */}
        <div className="p-4 bg-gradient-to-br from-teal-500/10 to-teal-500/20 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Icon path={mdiStar} size={1} className="text-teal-400" />
            <h4 className="font-semibold">Achievement Points</h4>
          </div>
          <div className="text-3xl font-bold text-teal-400">
            {totalPoints.toLocaleString()}
          </div>
          <p className="text-sm text-white/60">Total points earned</p>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Icon path={mdiTarget} size={1} className="text-cyan-400" />
              <h4 className="font-semibold">Next Milestone</h4>
            </div>
            <div className="text-lg font-bold mb-2">{nextMilestone.title}</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{totalPoints}</span>
                <span>{nextMilestone.points}</span>
              </div>
              <Progress 
                value={(totalPoints / nextMilestone.points) * 100} 
                className="h-2"
              />
              <p className="text-xs text-white/60">
                {nextMilestone.points - totalPoints} points to go
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`
              p-4 transition-all duration-300 hover:scale-105 cursor-pointer
              ${achievement.unlockedAt
                ? `bg-white/10 backdrop-blur-xl border border-white/20 shadow-md ${getRarityGlow(achievement.rarity)}`
                : 'bg-white/5 backdrop-blur-xl border border-white/10 opacity-70'
              }
            `}
          >
            {/* Achievement Icon and Rarity */}
            <div className="text-center mb-4">
              <div className={`
                relative inline-block p-4 rounded-full mb-2
                ${achievement.unlockedAt
                  ? 'bg-teal-500/20'
                  : 'bg-white/10'
                }
              `}>
                <Icon 
                  path={achievement.unlockedAt ? getCategoryIcon(achievement.category) : mdiLock}
                  size={1.5} 
                  className={`
                    ${achievement.unlockedAt 
                      ? 'text-teal-400' 
                      : 'text-white/60'
                    }
                  `}
                />
                
                {/* Rarity indicator */}
                {achievement.unlockedAt && achievement.rarity !== 'common' && (
                  <div className="absolute -top-1 -right-1">
                    <Icon 
                      path={mdiStar} 
                      size={0.8} 
                      className={
                        achievement.rarity === 'legendary' ? 'text-teal-400' :
                        achievement.rarity === 'epic' ? 'text-accent' :
                        'text-teal-400'
                      }
                    />
                  </div>
                )}
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-xs ${getRarityColor(achievement.rarity)}`}
              >
                {achievement.rarity}
              </Badge>
            </div>

            {/* Achievement Details */}
            <div className="space-y-3">
              <div className="text-center">
                <h4 className="font-semibold text-sm">{achievement.name}</h4>
                <p className="text-xs text-white/60 mt-1 line-clamp-2">
                  {achievement.description}
                </p>
              </div>

              {/* Progress */}
              {achievement.unlockedAt ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    <Icon path={mdiCheckCircle} size={0.6} className="text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                      Unlocked {achievement.unlockedAt.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm font-bold text-teal-400">
                      +{achievement.points} points
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {onShareAchievement && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareAchievement(achievement.id);
                        }}
                        className="flex-1 h-7 text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Icon path={mdiShare} size={0.5} className="mr-1" />
                        Share
                      </Button>
                    )}

                    {achievement.certificateUrl && onDownloadCertificate && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDownloadCertificate(achievement.id);
                        }}
                        className="flex-1 h-7 text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      >
                        <Icon path={mdiDownload} size={0.5} className="mr-1" />
                        Cert
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Progress</span>
                    <span className="font-medium">{achievement.progress || 0}/{achievement.target || 0}</span>
                  </div>
                  <Progress
                    value={achievement.target ? ((achievement.progress || 0) / achievement.target) * 100 : 0}
                    className="h-2"
                  />
                  <div className="text-center">
                    <span className="text-xs text-white/60">
                      {(achievement.target || 0) - (achievement.progress || 0)} to unlock
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Icon path={mdiTrophy} size={3} className="text-white/30 mx-auto mb-4" />
          <h4 className="font-semibold mb-2">No achievements found</h4>
          <p className="text-white/60">
            {filter === 'unlocked' 
              ? "You haven't unlocked any achievements yet. Keep working out to earn your first badge!"
              : `No achievements match the current filters.`
            }
          </p>
        </div>
      )}

      {/* Achievement Categories Legend */}
      <div className="mt-8 p-4 bg-white/10 rounded-lg">
        <h4 className="font-medium mb-3 text-sm">Achievement Categories</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Icon path={mdiDumbbell} size={0.6} className="text-teal-400" />
            <span>Workout Achievements</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon path={mdiFire} size={0.6} className="text-red-400" />
            <span>Streak Achievements</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon path={mdiTarget} size={0.6} className="text-emerald-500" />
            <span>Weight Achievements</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon path={mdiTrophy} size={0.6} className="text-teal-400" />
            <span>Milestone Achievements</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AchievementsBadges;