/**
 * Bedtime Reminder Scheduler Hook
 * Checks reminder times and triggers notifications with sound
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { alarmSound } from '../../utils/alarmSound';
import type { BedtimeReminder } from '../../types/health/sleep';

interface UseBedtimeReminderSchedulerOptions {
  reminders: BedtimeReminder[];
  enabled?: boolean;
  onReminderTriggered?: (reminder: BedtimeReminder) => void;
}

interface ReminderSchedulerState {
  activeReminder: BedtimeReminder | null;
  isShowing: boolean;
}

const getDayOfWeek = (): string => {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[new Date().getDay()];
};

const getCurrentTime = (): string => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const windDownLabels: Record<string, { icon: string; label: string }> = {
  reading: { icon: '📖', label: 'Reading' },
  meditation: { icon: '🧘', label: 'Meditation' },
  stretching: { icon: '🤸', label: 'Stretching' },
  journaling: { icon: '📝', label: 'Journaling' },
  music: { icon: '🎵', label: 'Relaxing Music' },
  bath: { icon: '🛁', label: 'Warm Bath' },
  tea: { icon: '🍵', label: 'Herbal Tea' },
  breathing: { icon: '🌬️', label: 'Deep Breathing' },
};

export const useBedtimeReminderScheduler = ({
  reminders,
  enabled = true,
  onReminderTriggered,
}: UseBedtimeReminderSchedulerOptions) => {
  const [state, setState] = useState<ReminderSchedulerState>({
    activeReminder: null,
    isShowing: false,
  });

  const lastTriggeredRef = useRef<string | null>(null);

  // Check if any reminder should trigger
  const checkReminders = useCallback(() => {
    if (!enabled || state.isShowing) return;

    const currentTime = getCurrentTime();
    const currentDay = getDayOfWeek();

    for (const reminder of reminders) {
      // Skip inactive reminders
      if (!reminder.isActive) continue;

      // Check if reminder is set for today
      if (!reminder.daysActive?.includes(currentDay)) continue;

      // Check if we already triggered this reminder in the last minute
      const reminderKey = `${reminder.id}-${currentTime}`;
      if (lastTriggeredRef.current === reminderKey) continue;

      // Check if current time matches reminder time
      if (currentTime === reminder.reminderTime) {
        // Trigger reminder!
        lastTriggeredRef.current = reminderKey;
        triggerReminder(reminder);
        break;
      }
    }
  }, [reminders, enabled, state.isShowing]);

  // Trigger a reminder
  const triggerReminder = useCallback((reminder: BedtimeReminder) => {
    console.log('Triggering bedtime reminder:', reminder.name || 'Bedtime Reminder');

    setState({
      activeReminder: reminder,
      isShowing: true,
    });

    // Play gentle sound for bedtime reminder
    alarmSound.playLoop('gentle', true);

    // Build notification body with wind down suggestions
    let body = "Time to start winding down for bed!";
    if (reminder.windDownSuggestions && reminder.windDownSuggestions.length > 0) {
      const suggestions = reminder.windDownSuggestions
        .map(s => windDownLabels[s]?.label || s)
        .join(', ');
      body += `\n\nSuggested activities: ${suggestions}`;
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(reminder.name || 'Bedtime Reminder', {
        body,
        icon: '/favicon.ico',
        tag: 'bedtime-reminder',
        requireInteraction: true,
      });

      notification.onclick = () => {
        alarmSound.stop();
        notification.close();
        window.focus();
      };
    }

    onReminderTriggered?.(reminder);
  }, [onReminderTriggered]);

  // Dismiss the reminder
  const dismissReminder = useCallback(() => {
    // Stop the sound
    alarmSound.stop();

    setState({
      activeReminder: null,
      isShowing: false,
    });
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Set up interval to check reminders every 30 seconds
  useEffect(() => {
    if (!enabled) return;

    // Initial check
    checkReminders();

    // Check every 30 seconds
    const intervalId = setInterval(checkReminders, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, checkReminders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      alarmSound.stop();
    };
  }, []);

  return {
    activeReminder: state.activeReminder,
    isShowing: state.isShowing,
    dismissReminder,
    windDownLabels,
  };
};

export default useBedtimeReminderScheduler;
