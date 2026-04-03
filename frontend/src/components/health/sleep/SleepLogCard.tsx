import React from 'react';
import { Moon, Clock, Sun, Trash2, Edit, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { QualityScoreBadge } from './QualityScoreBadge';
import { cn } from '../../../lib/utils';
import { formatSleepDuration, formatTime } from '../../../types/health/sleep';
import type { SleepLog } from '../../../types/health/sleep';

interface SleepLogCardProps {
  sleepLog: SleepLog;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  compact?: boolean;
}

export const SleepLogCard: React.FC<SleepLogCardProps> = ({
  sleepLog,
  onEdit,
  onDelete,
  onClick,
  compact = false,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: string) => {
    const moodEmojis: Record<string, string> = {
      refreshed: '😊',
      energetic: '⚡',
      neutral: '😐',
      tired: '😴',
      groggy: '🥱',
      relaxed: '😌',
      anxious: '😰',
      stressed: '😓',
    };
    return moodEmojis[mood || ''] || '😴';
  };

  const getEnvironmentIcon = (level?: string) => {
    if (!level) return null;
    const icons: Record<string, string> = {
      silent: '🔇',
      quiet: '🔈',
      moderate: '🔉',
      loud: '🔊',
      dark: '🌑',
      dim: '🌙',
      bright: '☀️',
      comfortable: '✅',
      cool: '❄️',
      cold: '🥶',
      warm: '🌡️',
      hot: '🔥',
    };
    return icons[level] || null;
  };

  if (compact) {
    return (
      <Card
        className={cn(
          'hover:bg-white/5 transition-colors cursor-pointer',
          onClick && 'cursor-pointer'
        )}
        onClick={() => onClick?.(sleepLog.id)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <QualityScoreBadge score={sleepLog.qualityScore || 0} size="sm" showLabel={false} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{formatDate(sleepLog.sleepDate)}</span>
              <span className="text-white/40 text-sm">
                {formatSleepDuration(sleepLog.actualSleepMinutes || 0)}
              </span>
            </div>
            <div className="text-xs text-white/60 flex items-center gap-2 mt-1">
              <Moon className="w-3 h-3" />
              <span>{formatTime(new Date(sleepLog.bedtime).toTimeString().substring(0, 5))}</span>
              <span>-</span>
              <Sun className="w-3 h-3" />
              <span>{formatTime(new Date(sleepLog.wakeTime).toTimeString().substring(0, 5))}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <QualityScoreBadge score={sleepLog.qualityScore || 0} size="md" />
            <div>
              <h3 className="font-semibold text-white text-lg">
                {formatDate(sleepLog.sleepDate)}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>{formatTime(new Date(sleepLog.bedtime).toTimeString().substring(0, 5))}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>{formatTime(new Date(sleepLog.wakeTime).toTimeString().substring(0, 5))}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>{formatSleepDuration(sleepLog.actualSleepMinutes || 0)}</span>
                </div>
              </div>

              {/* Tags and Environment */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {sleepLog.efficiencyPercentage !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(sleepLog.efficiencyPercentage)}% efficient
                  </Badge>
                )}
                {sleepLog.wokeUpCount !== undefined && sleepLog.wokeUpCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {sleepLog.wokeUpCount} wake-up{sleepLog.wokeUpCount > 1 ? 's' : ''}
                  </Badge>
                )}
                {sleepLog.moodAfter && (
                  <Badge variant="secondary" className="text-xs">
                    {getMoodEmoji(sleepLog.moodAfter)} {sleepLog.moodAfter}
                  </Badge>
                )}
                {sleepLog.noiseLevel && (
                  <Badge variant="outline" className="text-xs">
                    {getEnvironmentIcon(sleepLog.noiseLevel)} {sleepLog.noiseLevel}
                  </Badge>
                )}
                {sleepLog.lightLevel && (
                  <Badge variant="outline" className="text-xs">
                    {getEnvironmentIcon(sleepLog.lightLevel)} {sleepLog.lightLevel}
                  </Badge>
                )}
              </div>

              {/* Notes */}
              {sleepLog.notes && (
                <p className="text-sm text-white/50 mt-2 line-clamp-2">{sleepLog.notes}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(sleepLog.id);
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(sleepLog.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepLogCard;
