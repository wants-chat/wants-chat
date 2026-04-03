import React from 'react';
import { Moon, Clock, Bell, BellOff, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Switch } from '../../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { cn } from '../../../lib/utils';
import type { BedtimeReminder } from '../../../types/health/sleep';
import { formatTime } from '../../../types/health/sleep';

interface BedtimeReminderCardProps {
  reminder: BedtimeReminder;
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const daysMap: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const windDownSuggestions: Record<string, { icon: string; label: string }> = {
  reading: { icon: '📖', label: 'Reading' },
  meditation: { icon: '🧘', label: 'Meditation' },
  stretching: { icon: '🤸', label: 'Stretching' },
  journaling: { icon: '📝', label: 'Journaling' },
  music: { icon: '🎵', label: 'Relaxing Music' },
  bath: { icon: '🛁', label: 'Warm Bath' },
  tea: { icon: '🍵', label: 'Herbal Tea' },
  breathing: { icon: '🌬️', label: 'Deep Breathing' },
};

export const BedtimeReminderCard: React.FC<BedtimeReminderCardProps> = ({
  reminder,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const formatDaysActive = (days: string[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('sat') && !days.includes('sun')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('sat') && days.includes('sun')) {
      return 'Weekends';
    }
    return days.map((d) => daysMap[d] || d).join(', ');
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'push':
        return <Bell className="w-3 h-3" />;
      case 'silent':
        return <BellOff className="w-3 h-3" />;
      default:
        return <Bell className="w-3 h-3" />;
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        !reminder.isActive && 'opacity-50'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left side - Icon and Info */}
          <div className="flex items-start gap-4 flex-1">
            <div
              className={cn(
                'p-3 rounded-xl',
                reminder.isActive
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-500'
                  : 'bg-white/10'
              )}
            >
              <Moon className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white text-lg">
                  {reminder.name || 'Bedtime Reminder'}
                </h3>
                {!reminder.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Off
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-white">
                    {formatTime(reminder.reminderTime)}
                  </span>
                </div>
                {reminder.advanceNoticeMinutes && (
                  <span className="text-white/40">
                    ({reminder.advanceNoticeMinutes}min before bed)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs border-white/20">
                  {formatDaysActive(reminder.daysActive || [])}
                </Badge>
                <Badge variant="outline" className="text-xs border-white/20 flex items-center gap-1">
                  {getNotificationIcon(reminder.notificationType)}
                  {reminder.notificationType || 'push'}
                </Badge>
              </div>

              {/* Wind Down Suggestions */}
              {reminder.windDownSuggestions && reminder.windDownSuggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {reminder.windDownSuggestions.map((suggestion, index) => {
                    const info = windDownSuggestions[suggestion];
                    if (!info) return null;
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-white/5"
                      >
                        {info.icon} {info.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={reminder.isActive}
              onCheckedChange={() => onToggle?.(reminder.id)}
            />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 z-50">
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(reminder.id)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(reminder.id)}
                    className="text-red-400 focus:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BedtimeReminderCard;
