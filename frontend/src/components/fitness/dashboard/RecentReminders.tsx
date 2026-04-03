import React from 'react';
import Icon from '@mdi/react';
import { 
  mdiBell,
  mdiDumbbell,
  mdiTrophy,
  mdiFire,
  mdiTrendingUp,
  mdiCheckCircle,
  mdiClockOutline,
  mdiAlert
} from '@mdi/js';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface Reminder {
  id: string;
  type: 'workout' | 'progress' | 'achievement' | 'streak' | 'missed';
  title: string;
  message: string;
  time: Date | string; // Support both Date and ISO string
  priority: 'low' | 'medium' | 'high';
  actionable?: boolean;
}

interface RecentRemindersProps {
  reminders: Reminder[];
  loading?: boolean;
  onAction?: (id: string, action: string) => void;
  onDismiss?: (id: string) => void;
}

const RecentReminders: React.FC<RecentRemindersProps> = ({
  reminders,
  loading,
  onAction,
  onDismiss
}) => {
  const getReminderIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'workout': return mdiDumbbell;
      case 'progress': return mdiTrendingUp;
      case 'achievement': return mdiTrophy;
      case 'streak': return mdiFire;
      case 'missed': return mdiAlert;
      default: return mdiBell;
    }
  };

  const getPriorityColor = (priority: Reminder['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'low': return 'bg-white/10 text-white/60 border-white/20';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const getTimeDisplay = (time: Date | string) => {
    const now = new Date();
    const timeDate = typeof time === 'string' ? new Date(time) : time;
    const diff = now.getTime() - timeDate.getTime();
    const minutes = Math.floor(diff / (60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return timeDate.toLocaleDateString();
  };

  const getActionButton = (reminder: Reminder) => {
    switch (reminder.type) {
      case 'workout':
        return (
          <Button 
            size="sm" 
            onClick={() => onAction?.(reminder.id, 'start_workout')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white h-6 px-2 text-xs"
          >
            Start Now
          </Button>
        );
      case 'missed':
        return (
          <Button 
            size="sm" 
            onClick={() => onAction?.(reminder.id, 'reschedule')}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-6 px-2 text-xs"
          >
            Reschedule
          </Button>
        );
      case 'streak':
        return (
          <Button 
            size="sm" 
            onClick={() => onAction?.(reminder.id, 'maintain_streak')}
            className="bg-orange-500 hover:bg-orange-600 text-white h-6 px-2 text-xs"
          >
            Keep Streak
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 text-center bg-white/10 backdrop-blur-xl border border-white/20">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mb-4"></div>
        <p className="text-sm text-white/60">Loading reminders...</p>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card className="p-6 text-center bg-white/10 backdrop-blur-xl border border-white/20">
        <Icon path={mdiBell} size={1.5} className="text-white/30 mx-auto mb-3" />
        <p className="text-sm text-white/60">No recent reminders</p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-white/10 backdrop-blur-xl border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon path={mdiBell} size={0.8} className="text-teal-400" />
          <h3 className="font-semibold text-white">Recent Reminders</h3>
        </div>
        <Badge className="text-xs bg-white/10 border border-white/20 text-white/80">
          {reminders.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {reminders.slice(0, 4).map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
          >
            <div className={`p-1.5 rounded-lg flex-shrink-0 ${getPriorityColor(reminder.priority)}`}>
              <Icon
                path={getReminderIcon(reminder.type)}
                size={0.6}
                className="text-current"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-white truncate">
                  {reminder.title}
                </h4>
                <span className="text-xs text-white/60 ml-2 flex items-center gap-1">
                  <Icon path={mdiClockOutline} size={0.4} />
                  {getTimeDisplay(reminder.time)}
                </span>
              </div>

              <p className="text-xs text-white/60 mb-2">
                {reminder.message}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getActionButton(reminder)}

                  <Button
                    size="sm"
                    onClick={() => onDismiss?.(reminder.id)}
                    className="h-6 px-2 text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20"
                  >
                    <Icon path={mdiCheckCircle} size={0.4} className="mr-1" />
                    Dismiss
                  </Button>
                </div>

                {reminder.priority === 'high' && (
                  <Badge className="text-xs px-1 py-0 bg-red-500/20 text-red-400 border border-red-500/30">
                    Urgent
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {reminders.length > 4 && (
        <div className="mt-3 pt-3 border-t border-white/10 text-center">
          <p className="text-xs text-white/60">
            +{reminders.length - 4} more reminders
          </p>
        </div>
      )}
    </Card>
  );
};

export default RecentReminders;